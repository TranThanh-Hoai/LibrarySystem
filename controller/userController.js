const bcrypt = require('bcryptjs');
const User = require('../schemas/User');
const Role = require('../schemas/Role');

const getAllUsers = async () => {
  const users = await User.find().populate('role_id');
  return users;
};

const getUserById = async (id) => {
  const user = await User.findById(id).populate('role_id');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const createUser = async (data) => {
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

  return { message: 'User created successfully', user };
};

const updateUser = async (id, data) => {
  const { username, full_name, email, role_name } = data;

  // Find role if provided
  let role_id;
  if (role_name) {
    const role = await Role.findOne({ name: role_name });
    if (!role) {
      throw new Error('Invalid role');
    }
    role_id = role._id;
  }

  const updateData = {};
  if (username) updateData.username = username;
  if (full_name) updateData.full_name = full_name;
  if (email) updateData.email = email;
  if (role_id) updateData.role_id = role_id;

  const user = await User.findByIdAndUpdate(id, updateData, { new: true }).populate('role_id');
  if (!user) {
    throw new Error('User not found');
  }

  return { message: 'User updated successfully', user };
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error('User not found');
  }
  return { message: 'User deleted successfully' };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};