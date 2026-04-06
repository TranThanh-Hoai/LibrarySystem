const Role = require('../schemas/Role');

const seedRoles = async () => {
  try {
    const roleCount = await Role.countDocuments();
    if (roleCount === 0) {
      console.log('🔄 No roles found in database. Initializing default roles...');
      
      const roles = [
        { name: 'admin', description: 'System Administrator' },
        { name: 'user', description: 'Regular User' }
      ];

      await Role.insertMany(roles);
      console.log('✅ Default roles (admin, user) created successfully.');
    } else {
      console.log('ℹ️ Roles already exist in database.');
    }
  } catch (error) {
    console.error('❌ Error seeding roles:', error.message);
  }
};

module.exports = { seedRoles };
