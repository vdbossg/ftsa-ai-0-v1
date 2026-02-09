const mongoose = require('mongoose');

let adminConnection;

const connectAdminDB = async () => {
  if (adminConnection) return adminConnection;

  try {
    adminConnection = await mongoose.createConnection(process.env.MONGO_URI_ADMIN, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to Admin MongoDB (FAQs)');
    return adminConnection;
  } catch (err) {
    console.error('❌ Admin MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectAdminDB;
