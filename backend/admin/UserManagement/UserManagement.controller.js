const UserManagement = require('./UserManagement.model');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserManagement.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Get user by id
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserManagement.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { username, email, role, isActive } = req.body;
    const newUser = new UserManagement({ username, email, role, isActive });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const updatedUser = await UserManagement.findByIdAndUpdate(userId, updates, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: 'Error updating user', error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await UserManagement.findByIdAndDelete(userId);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};