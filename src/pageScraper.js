// src/pageScraper.js
async function scrapePageContent(client, url) {
  console.log('Scraping page content...');
  try {
    const response = await client.get(url);
    if (response.status === 200) {
      console.log('Page content scraped successfully.');
      return response.data; // The HTML content
    } else {
      throw new Error(`Failed to fetch page, status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error during page scraping:', error.message);
    return null;
  }
}

module.exports = { scrapePageContent };