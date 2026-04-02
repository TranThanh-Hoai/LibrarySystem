const mongoose = require('mongoose');
const Role = require('./schemas/Role');

const seedRoles = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/LibrarySystem');

    const roles = [
      { name: 'admin', description: 'Administrator' },
      { name: 'thủ thư', description: 'Librarian' },
      { name: 'người dùng', description: 'User' }
    ];

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role(roleData);
        await role.save();
        console.log(`Role ${roleData.name} created`);
      } else {
        console.log(`Role ${roleData.name} already exists`);
      }
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedRoles();