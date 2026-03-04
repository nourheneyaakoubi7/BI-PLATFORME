const FileManagement = require('./FileManagement.model');
const xlsx = require('xlsx');
const csv = require('csv-parser');
const { Readable } = require('stream');

//parse file buffer
const parseFileBuffer = async (buffer, mimetype) => {
  if (mimetype === 'text/csv') {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = Readable.from(buffer.toString());
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  } else {
    // for xls/xlsx
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  }
};

// Export route handlers
exports.uploadFile = async (req, res) => {
  try {
    const { filename } = req.body; // only extract filename
    const userId = req.user.id;
    const buffer = req.file.buffer;
    const mimetype = req.file.mimetype;

    const parsedData = await parseFileBuffer(buffer, mimetype);
    const columns = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];

    const newFile = new FileManagement({
      userId,
      filename,
      originalName: filename,
      fileType: mimetype,
      fileData: buffer,
      parsedData,
      columns
    });

    await newFile.save();
    res.status(201).json(newFile);
  } catch (err) {
    console.error('Error saving file:', err);
    res.status(500).json({ message: 'Error saving file', error: err.message });
  }
};

exports.getUserFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await FileManagement.find({ userId }).sort({ uploadedAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching files', error: err.message });
  }
};

exports.getFileContent = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await FileManagement.findById(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (!file.parsedData || file.parsedData.length === 0) {
      const parsedData = await parseFileBuffer(file.fileData, file.fileType);
      file.parsedData = parsedData;
      file.columns = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];
      await file.save();
    }

    res.json({
      filename: file.originalName,
      content: file.parsedData,
      columns: file.columns,
      rowCount: file.parsedData.length,
      columnCount: file.columns.length
    });
  } catch (err) {
    console.error('Error fetching file content:', err);
    res.status(500).json({ message: 'Error fetching file content', error: err.message });
  }
};

exports.updateFile = async (req, res) => {
  try {
    const { content, newFilename, columnUpdates } = req.body;
    const fileId = req.params.id;
    const file = await FileManagement.findById(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    let updatedContent = content;
    if (columnUpdates) {
      if (columnUpdates.renamedColumns) {
        updatedContent = content.map(row => {
          const newRow = {};
          Object.keys(row).forEach(key => {
            const newKey = columnUpdates.renamedColumns[key] || key;
            newRow[newKey] = row[key];
          });
          return newRow;
        });
      }
      if (columnUpdates.deletedColumns) {
        updatedContent = content.map(row => {
          const newRow = { ...row };
          columnUpdates.deletedColumns.forEach(col => delete newRow[col]);
          return newRow;
        });
      }
    }

    if (newFilename) {
      const newFile = new FileManagement({
        userId: file.userId,
        filename: newFilename,
        originalName: newFilename,
        fileType: file.fileType,
        fileData: file.fileData,
        parsedData: updatedContent,
        columns: updatedContent.length > 0 ? Object.keys(updatedContent[0]) : []
      });
      await newFile.save();
      return res.json({ ...newFile.toObject(), content: updatedContent });
    }

    // save updates
    file.parsedData = updatedContent;
    file.columns = updatedContent.length > 0 ? Object.keys(updatedContent[0]) : [];
    await file.save();
    res.json({ ...file.toObject(), content: updatedContent });
  } catch (err) {
    console.error('Error updating file:', err);
    res.status(500).json({ message: 'Error updating file', error: err.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await FileManagement.findById(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    res.set({
      'Content-Type': file.fileType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': file.fileData.length
    });
    res.send(file.fileData);
  } catch (err) {
    console.error('Error downloading file:', err);
    res.status(500).json({ message: 'Error downloading file', error: err.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    await FileManagement.findByIdAndDelete(fileId);
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting file', error: err.message });
  }
};