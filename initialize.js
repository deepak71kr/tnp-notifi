// initialize.js
require('dotenv').config({ override: true });
const { login } = require('./src/auth');
const { scrapePageContent } = require('./src/pageScraper');
const { processContent } = require('./src/contentProcessor');
const { writeData, closeConnection } = require('./src/dataManager');
const { sendNotification } = require('./src/notificationSender');

const TARGET_PAGE_URL = process.env.TARGET_PAGE_URL;
const JOBS_PAGE_URL = 'https://tp.bitmesra.co.in/applyjobs.html';

async function initializeData() {
  console.log('--- initializeData started ---');
  try {
    const client = await login();

    const htmlContent = await scrapePageContent(client, TARGET_PAGE_URL, JOBS_PAGE_URL);
    if (!htmlContent) {
      console.error('Failed to scrape page content. Initialization aborted.');
      return;
    }

    const { newJobs, newNotifications } = processContent(htmlContent);

    await writeData('previous_jobs', newJobs);
    await writeData('previous_notifications', newNotifications);
    console.log('Initialization complete. Database collections have been created with initial data.');

    const initialEmailContent = {
      jobs: newJobs,
      notifications: newNotifications,
    };
    await sendNotification('Initial Scrape Complete', initialEmailContent);

    console.log('A confirmation email with the initial data has been sent.');
  } catch (error) {
    console.error('An error occurred during initialization:', error);
  } finally {
    await closeConnection();
    console.log('--- initializeData finished ---');
  }
}

initializeData();