import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectToDatabase } from './config/database.js';
import { ROLE } from './constants/roles.js';
import User from './models/user.js';

const BCRYPT_ROUNDS = 12;
const seedUsers = [
  { role: ROLE.ADMIN, prefix: 'SEED_ADMIN' },
  { role: ROLE.AGENT, prefix: 'SEED_AGENT' },
  { role: ROLE.CUSTOMER, prefix: 'SEED_CUSTOMER' }
].map(({ role, prefix }) => ({
  role,
  name: process.env[`${prefix}_NAME`]?.trim(),
  email: process.env[`${prefix}_EMAIL`]?.trim().toLowerCase(),
  password: process.env[`${prefix}_PASSWORD`]
}));

function validateSeedUsers() {
  for (const user of seedUsers) {
    if (!user.name || !user.email || !user.password) {
      throw new Error(`Set ${user.role} seed name, email, and password in the root .env file`);
    }
    if (user.name.length < 2 || user.name.length > 100) {
      throw new Error(`The ${user.role} seed name must be between 2 and 100 characters`);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      throw new Error(`The ${user.role} seed email is invalid`);
    }
    if (user.password.length < 8 || Buffer.byteLength(user.password, 'utf8') > 72) {
      throw new Error(`The ${user.role} seed password must be 8–72 UTF-8 bytes`);
    }
  }

  const emails = seedUsers.map(({ email }) => email);
  if (new Set(emails).size !== emails.length) {
    throw new Error('Admin, agent, and customer seed emails must be different');
  }
}

async function seed() {
  validateSeedUsers();
  await connectToDatabase();

  for (const user of seedUsers) {
    const passwordHash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
    await User.findOneAndUpdate(
      { email: user.email },
      {
        $set: { name: user.name, passwordHash, role: user.role, isActive: true },
        $setOnInsert: { email: user.email }
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    console.log(`Seeded ${user.role}: ${user.email}`);
  }
}

try {
  await seed();
} catch (error) {
  console.error('Could not seed development users:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
