// index.js
require('dotenv').config({ override: true });
const { login } = require('./src/auth');
const { scrapePageContent } = require('./src/pageScraper');
const { processContent, compareNewEntries } = require('./src/contentProcessor');
const { readData, writeData } = require('./src/dataManager');
const { sendNotification } = require('./src/notificationSender');

const CHECK_INTERVAL_MINUTES = parseInt(process.env.CHECK_INTERVAL_MINUTES, 10) || 30;
const TARGET_PAGE_URL = process.env.TARGET_PAGE_URL;

async function monitorJobPortal() {
  console.log(`[${new Date().toLocaleString()}] Starting new check for job listings and notifications...`);

  try {
    const client = await login();

    const htmlContent = await scrapePageContent(client, TARGET_PAGE_URL);
    if (!htmlContent) {
      console.error('Failed to scrape page content. Skipping this run.');
      return;
    }

    const { newJobs, newNotifications } = processContent(htmlContent);

    const previousJobs = readData('previous_jobs');
    const previousNotifications = readData('previous_notifications');

    const newJobEntries = compareNewEntries(previousJobs, newJobs, (job) => job.company + job.postedDate + job.deadline);
    const newNotificationEntries = compareNewEntries(previousNotifications, newNotifications, (notification) => notification.title + notification.date);

    let newContentFound = false;

    if (newJobEntries.length > 0) {
      console.log(`Found ${newJobEntries.length} new job listing(s)!`);
      await sendNotification('New Job Listings Found', { jobs: newJobEntries, notifications: [] });
      newContentFound = true;
    }

    if (newNotificationEntries.length > 0) {
      console.log(`Found ${newNotificationEntries.length} new notification(s)!`);
      await sendNotification('New Notifications Found', { jobs: [], notifications: newNotificationEntries });
      newContentFound = true;
    }

    if (newContentFound) {
      writeData('previous_jobs', newJobs);
      writeData('previous_notifications', newNotifications);
      console.log('Data files updated with the latest content.');
    } else {
      console.log('No new content found.');
    }

  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] An error occurred during monitoring:`, error);
  } finally {
    console.log(`[${new Date().toLocaleString()}] Check finished. Waiting for next run.`);
  }
}

console.log('Starting initial run...');
monitorJobPortal().then(() => {
    console.log(`Starting scheduled monitoring. Will check every ${CHECK_INTERVAL_MINUTES} minutes.`);
    setInterval(monitorJobPortal, CHECK_INTERVAL_MINUTES * 60 * 1000);
});