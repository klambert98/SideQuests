#!/usr/bin/env node

/**
 * Interactive Deployment Helper
 * 
 * This script provides an interactive menu for deploying the portfolio
 */

const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(message) {
  const line = '═'.repeat(80);
  console.log();
  log(line, colors.cyan);
  log(message, colors.bright + colors.cyan);
  log(line, colors.cyan);
  console.log();
}

function menu() {
  header('Personal Portfolio - Deployment Menu');
  
  log('Local Deployment:', colors.yellow);
  log('  1. Deploy locally (Docker) - Update existing', colors.white);
  log('  2. Deploy locally (Docker) - Fresh install + seeds', colors.white);
  log('  3. View Docker logs', colors.white);
  console.log();
  
  log('Health Checks:', colors.yellow);
  log('  4. Health check - Local', colors.white);
  log('  5. Health check - Fly.io', colors.white);
  console.log();
  
  log('Utilities:', colors.yellow);
  log('  6. Clean up old migration files', colors.white);
  log('  7. Generate password hash', colors.white);
  console.log();
  
  log('  0. Exit', colors.white);
  console.log();
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset} `, resolve);
  });
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..')
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function generatePasswordHash() {
  const password = await question('Enter password to hash: ');
  console.log();
  
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync(password, 10);
  
  log('Password hash:', colors.green);
  log(hash, colors.white);
  console.log();
  
  log('Use this in your seed file:', colors.yellow);
  log(`password = '${hash}'`, colors.white);
  console.log();
}

async function handleChoice(choice) {
  try {
    switch (choice) {
      case '1':
        header('Deploying locally (update existing)...');
        await runCommand('npm', ['run', 'deploy:local']);
        break;
      
      case '2':
        header('Deploying locally (fresh install)...');
        log('WARNING: This will delete all existing data!', colors.red);
        const confirm = await question('Type YES to confirm: ');
        if (confirm === 'YES') {
          await runCommand('npm', ['run', 'deploy:local:fresh']);
        } else {
          log('Cancelled', colors.yellow);
        }
        break;
      
      case '3':
        header('Docker logs (Ctrl+C to exit)...');
        await runCommand('npm', ['run', 'docker:logs']);
        break;
      
      case '4':
        header('Health check - Local...');
        await runCommand('npm', ['run', 'health']);
        break;
      
      case '5':
        header('Health check - Fly.io...');
        await runCommand('npm', ['run', 'health:flyio']);
        break;
      
      case '6':
        header('Clean up old migration files...');
        await runCommand('powershell', [
          '-ExecutionPolicy', 'Bypass',
          '-File', './deploy/scripts/remove-legacy-files.ps1'
        ]);
        break;
      
      case '7':
        await generatePasswordHash();
        break;
      
      case '0':
        log('Goodbye!', colors.green);
        rl.close();
        process.exit(0);
        break;
      
      default:
        log('Invalid choice', colors.red);
    }
  } catch (error) {
    log(`\nError: ${error.message}`, colors.red);
  }
}

async function main() {
  while (true) {
    menu();
    const choice = await question('Select an option:');
    await handleChoice(choice);
    
    if (choice !== '0') {
      await question('\nPress Enter to continue...');
      console.clear();
    }
  }
}

// Check if bcryptjs is available
try {
  require('bcryptjs');
} catch (err) {
  log('Installing required dependencies...', colors.yellow);
  require('child_process').execSync('npm install', { stdio: 'inherit' });
}

main().catch((err) => {
  log(`Error: ${err.message}`, colors.red);
  process.exit(1);
});
