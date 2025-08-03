// src/contentProcessor.js
const cheerio = require('cheerio');

function extractJobs(html) {
  const $ = cheerio.load(html);
  const jobs = [];
  $('#job-listings tbody tr').each((i, el) => {
    const $row = $(el);
    const columns = $row.find('td');
    if (columns.length > 0) {
      jobs.push({
        company: $(columns[0]).text().trim(),
        deadline: $(columns[1]).text().trim(),
        postedDate: $(columns[2]).text().trim(),
        link: $(columns[3]).find('a').attr('href') ? `https://tp.bitmesra.co.in/${$(columns[3]).find('a').attr('href')}` : null,
      });
    }
  });
  return jobs;
}

function extractNotifications(html) {
  const $ = cheerio.load(html);
  const notifications = [];
  $('#newseventsx1 tbody tr').each((i, el) => {
    const $row = $(el);
    const columns = $row.find('td');
    if (columns.length > 0) {
      notifications.push({
        title: $(columns[0]).text().trim(),
        type: $(columns[1]).text().trim(),
        date: $(columns[2]).text().trim(),
        link: $(columns[0]).find('a').attr('href') ? `https://tp.bitmesra.co.in/${$(columns[0]).find('a').attr('href')}` : null,
      });
    }
  });
  return notifications;
}

function processContent(htmlContent) {
  if (!htmlContent) {
    console.error('No HTML content provided to process.');
    return { newJobs: [], newNotifications: [] };
  }
  const newJobs = extractJobs(htmlContent);
  const newNotifications = extractNotifications(htmlContent);
  return { newJobs, newNotifications };
}

function compareNewEntries(oldArray, newArray, keyFunction) {
  const oldSet = new Set(oldArray.map(keyFunction));
  const newEntries = newArray.filter(item => !oldSet.has(keyFunction(item)));
  return newEntries;
}

module.exports = {
  extractJobs,
  extractNotifications,
  processContent,
  compareNewEntries,
};
