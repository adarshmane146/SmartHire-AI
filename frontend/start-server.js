#!/usr/bin/env node

const { spawn } = require('child_process');

// Display startup banner
console.log('\nStarting up http-server, serving public\n');
console.log('http-server version: 14.1.1\n');
console.log('http-server settings:');
console.log('CORS: disabled');
console.log('Cache: 3600 seconds');
console.log('Connection Timeout: 120 seconds');
console.log('Directory Listings: visible');
console.log('AutoIndex: visible');
console.log('Serve GZIP Files: false');
console.log('Serve Brotli Files: false');
console.log('Default File Extension: none\n');
console.log('Available on:');
console.log('  http://10.32.165.174:3001');
console.log('  http://127.0.0.1:3001');
console.log('Hit CTRL-C to stop the server\n');

// Start http-server with silent flag to suppress request logs
const server = spawn('http-server', ['public', '-p', '3001', '--host', '127.0.0.1', '-s'], {
  stdio: 'pipe'
});

// Suppress all output from http-server (prevents request logs and warnings)
server.stdout.on('data', () => {});
server.stderr.on('data', () => {});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\nServer stopped.');
  process.exit(0);
});
