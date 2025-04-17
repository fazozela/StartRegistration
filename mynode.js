const fs = require('fs');
const path = require('path');
const successColor = '\x1b[32m%s\x1b[0m';
const checkSign = '\u{2705}';
const dotenv = require('dotenv').config({ path: 'src/.env' });;

const envFile = `export const environment = {
  FIREBASE_API_KEY: '${process.env.FIREBASE_API_KEY}',
  FIREBASE_AUTH_DOMAIN: '${process.env.FIREBASE_AUTH_DOMAIN}',
  FIREBASE_PROJECT_ID: '${process.env.FIREBASE_PROJECT_ID}',
  FIREBASE_STORAGE_BUCKET: '${process.env.FIREBASE_STORAGE_BUCKET}',
  FIREBASE_MESSAGING_SENDER_ID: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',
  FIREBASE_APP_ID: '${process.env.FIREBASE_APP_ID}',
  FIREBASE_MEASUREMENT_ID: '${process.env.FIREBASE_MEASUREMENT_ID}',
};
`;
const targetPath = path.join(__dirname, './src/environments/environment.development.ts');
fs.writeFile(targetPath, envFile, (err) => {
  if (err) {
    console.error(err);
    throw err;
  } else {
    console.log(successColor, `${checkSign} Successfully generated environment.development.ts`);
  }
});