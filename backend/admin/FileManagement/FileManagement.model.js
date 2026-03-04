const mongoose = require('mongoose');

const fileManagementSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileType: { type: String, required: true },
  fileData: { type: Buffer, default: Buffer.from('') },
  parsedData: { type: Array, default: [] },
  columns: { type: Array, default: [] },
  uploadedAt: { type: Date, default: Date.now }
});

const FileManagement = mongoose.model('FileManagement', fileManagementSchema);
module.exports = FileManagement;