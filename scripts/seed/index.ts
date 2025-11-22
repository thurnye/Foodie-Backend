/**
 * Database Seeding Script
 * Usage: npm run seed
 *
 * This script seeds the database with dummy data for testing
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FoodieBlog';

/**
 * User model (minimal for seeding)
 */
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  username: String,
  bio: String,
  role: String,
  reputation: Number,
  isEmailVerified: Boolean,
});

const User = mongoose.model('User', UserSchema);

/**
 * Sample users to seed
 */
const sampleUsers = [
  {
    email: 'testprogram404@gmail.com',
    password: 'Password123!',
    firstName: 'Admin',
    lastName: 'Food-Admin',
    username: 'johndoe',
    bio: 'Food enthusiast and home chef',
    role: 'admin',
    reputation: 100,
    isEmailVerified: true,
  },
  {
    email: 'john.doe@example.com',
    password: 'Password123',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    bio: 'Food enthusiast and home chef',
    role: 'user',
    reputation: 100,
    isEmailVerified: true,
  },
  {
    email: 'jane.smith@example.com',
    password: 'Password123',
    firstName: 'Jane',
    lastName: 'Smith',
    username: 'janesmith',
    bio: 'Professional chef and recipe creator',
    role: 'user',
    reputation: 250,
    isEmailVerified: true,
  },
  {
    email: 'admin@foodie.com',
    password: 'AdminPass123',
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    bio: 'Platform administrator',
    role: 'user',
    reputation: 500,
    isEmailVerified: true,
  },
  {
    email: 'chef.gordon@example.com',
    password: 'Password123',
    firstName: 'Gordon',
    lastName: 'Chef',
    username: 'chefgordon',
    bio: 'Master chef with 20 years of experience',
    role: 'user',
    reputation: 1000,
    isEmailVerified: true,
  },
  {
    email: 'baker.mary@example.com',
    password: 'Password123',
    firstName: 'Mary',
    lastName: 'Baker',
    username: 'marybaker',
    bio: 'Pastry chef and baking expert',
    role: 'user',
    reputation: 350,
    isEmailVerified: true,
  },
];

/**
 * Seed database with users
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - be careful in production!)
    const shouldClear = process.env.CLEAR_DB === 'true';
    if (shouldClear) {
      await User.deleteMany({});
      console.log('🗑️  Cleared existing users');
    }

    // Hash passwords and create users
    console.log('👤 Creating users...');
    const usersToCreate = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Log created users (without passwords)
    console.log('\n📋 Created Users:');
    createdUsers.forEach((user) => {
      console.log(`  - ${user.email} (${user.username}) - Role: ${user.role}`);
    });

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('  Email: john.doe@example.com');
    console.log('  Password: Password123');
    console.log('\n  Email: admin@foodie.com');
    console.log('  Password: AdminPass123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run seeding
seedDatabase();
