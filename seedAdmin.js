const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./schemas/User');
const Role = require('./schemas/Role');

const seedAdmin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/LibrarySystem');

    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      console.log('Admin role not found. Run seedRoles.js first.');
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('admin123', salt);

    const admin = new User({
      username: 'admin',
      password_hash,
      full_name: 'Administrator',
      email: 'admin@library.com',
      role_id: adminRole._id
    });

    await admin.save();
    console.log('Admin user created: username=admin, password=admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding admin failed:', error);
    process.exit(1);
  }
};

seedAdmin();