require('dotenv').config({ path: 'src/.env' });
const fs = require('fs');
const path = require('path');

const envFileContent = `
export const environment = {
  production: false,
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN}',
    projectId: '${process.env.FIREBASE_PROJECT_ID}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',
    appId: '${process.env.FIREBASE_APP_ID}',
    measurementId: '${process.env.FIREBASE_MEASUREMENT_ID}'
  }
};`;

const devEnvPath = path.resolve(__dirname, './src/environments/environment.development.ts');
const prodEnvPath = path.resolve(__dirname, './src/environments/environment.ts');

// Write development environment
fs.writeFileSync(devEnvPath, envFileContent);
console.log('✅ environment.development.ts created');

// Write production environment (same content for now)
fs.writeFileSync(prodEnvPath, envFileContent);
console.log('✅ environment.ts created');