// src/pageScraper.js
const axios = require('axios');

async function scrapePageContent(client, dashboardUrl, jobsUrl) {
  console.log('Scraping dashboard and jobs page content...');
  try {
    // Fetch the main dashboard page
    const dashboardResponse = await client.get(dashboardUrl);
    if (dashboardResponse.status !== 200) {
      throw new Error(`Failed to fetch dashboard page, status code: ${dashboardResponse.status}`);
    }
    console.log('Dashboard content scraped successfully.');

    // Fetch the dedicated jobs page
    const jobsResponse = await client.get(jobsUrl);
    if (jobsResponse.status !== 200) {
      throw new Error(`Failed to fetch jobs page, status code: ${jobsResponse.status}`);
    }
    console.log('Jobs page content scraped successfully.');

    return {
      dashboardHtml: dashboardResponse.data,
      jobsHtml: jobsResponse.data
    };
  } catch (error) {
    console.error('Error during page scraping:', error.message);
    return null;
  }
}

module.exports = { scrapePageContent };