const authService = require('./auth.service');

// Sign Up
async function signup(req, res) {
  try {
    const { email, username, password } = req.body;
    const newUser = await authService.signup(email, username, password);
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Login
async function login(req, res) {
  try {
    console.log('LOGIN BODY:', req.body); 
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


module.exports = { signup, login };
