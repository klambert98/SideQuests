import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const createUser = async () => {
  try {
    console.log('=== Create New User ===\n');

    // Get user input
    const email = await question('Enter email address: ');
    const password = await question('Enter password (min 6 characters): ');
    const name = await question('Enter name (optional): ');
    const bio = await question('Enter bio (optional): ');

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Error: Invalid email address');
      process.exit(1);
    }

    // Validate password
    if (password.length < 6) {
      console.error('Error: Password must be at least 6 characters');
      process.exit(1);
    }

    // Initialize database
    await AppDataSource.initialize();
    console.log('\nDatabase connected');

    const userRepository = AppDataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User();
    user.email = email;
    user.password = hashedPassword;
    user.name = name || 'Admin';
    user.bio = bio || '';

    await userRepository.save(user);

    console.log('\n✅ User created successfully!');
    console.log(`\nEmail: ${email}`);
    console.log(`Name: ${name || '(not set)'}`);
    console.log(`\nYou can now login at: http://localhost:3000/login`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
};

createUser();
