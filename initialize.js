// initialize.js
require('dotenv').config({ override: true });
const { login } = require('./src/auth');
const { scrapePageContent } = require('./src/pageScraper');
const { processContent } = require('./src/contentProcessor');
const { writeData } = require('./src/dataManager');
const { sendNotification } = require('./src/notificationSender');

const TARGET_PAGE_URL = process.env.TARGET_PAGE_URL;

async function initializeData() {
  console.log('--- initializeData started ---');
  try {
    const client = await login();

    const htmlContent = await scrapePageContent(client, TARGET_PAGE_URL);
    if (!htmlContent) {
      console.error('Failed to scrape page content. Initialization aborted.');
      return;
    }

    const { newJobs, newNotifications } = processContent(htmlContent);

    writeData('previous_jobs', newJobs);
    writeData('previous_notifications', newNotifications);
    console.log('Initialization complete. `previous_jobs.json` and `previous_notifications.json` have been created.');

    const initialEmailContent = {
      jobs: newJobs,
      notifications: newNotifications,
    };
    await sendNotification('Initial Scrape Complete', initialEmailContent);

    console.log('A confirmation email with the initial data has been sent.');
  } catch (error) {
    console.error('An error occurred during initialization:', error);
  } finally {
    console.log('--- initializeData finished ---');
  }
}

initializeData();