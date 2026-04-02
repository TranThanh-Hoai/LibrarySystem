const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../schemas/User');
const Role = require('../schemas/Role');

const register = async (data) => {
  const { username, password, full_name, email, role_name } = data;

  // Check if user exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new Error('Username or email already exists');
  }

  // Find role
  const role = await Role.findOne({ name: role_name });
  if (!role) {
    throw new Error('Invalid role');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Create user
  const user = new User({
    username,
    password_hash,
    full_name,
    email,
    role_id: role._id
  });

  await user.save();

  return { message: 'User registered successfully' };
};

const login = async (data) => {
  const { username, password } = data;

  // Find user
  const user = await User.findOne({ username }).populate('role_id');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = jwt.sign(
    { userId: user._id, username: user.username, role: user.role_id.name },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role: user.role_id.name
    }
  };
};

module.exports = {
  register,
  login
};