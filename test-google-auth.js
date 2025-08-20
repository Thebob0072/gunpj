// test-google-auth.js
require('dotenv').config(); // To read .env.local file
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Function to run the test
async function testAuth() {
  console.log('--- Starting Google Sheets Auth Test ---');

  // Check if environment variables are loaded
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
    console.error('❌ ERROR: Environment variables are missing. Please check your .env.local file.');
    return;
  }

  console.log('✅ Environment variables loaded.');

  try {
    // Initialize the JWT auth client
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('✅ JWT auth client created.');

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

    console.log('🔄 Loading document info...');
    await doc.loadInfo(); // This is the actual API call
    
    console.log('🎉 SUCCESS! Successfully connected and loaded sheet with title:', doc.title);

  } catch (error) {
    console.error('❌ TEST FAILED! An error occurred:');
    console.error(error);
  }
}

testAuth();