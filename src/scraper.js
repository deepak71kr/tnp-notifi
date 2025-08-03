const cheerio = require('cheerio');
const fs = require('fs');
const axios = require('axios');

// ...existing code...

// After login, fetch the jobs page, not just index.html
const jobsPageResponse = await client.get('https://tp.bitmesra.co.in/applyjobs.html');
const htmlString = jobsPageResponse.data;

console.log('HTML length:', htmlString.length);
console.log('HTML preview:', htmlString.slice(0, 500)); // Print first 500 chars

const $ = cheerio.load(htmlString);

// Debug: print the whole jobs table and notifications table HTML
console.log('--- #job-listings table HTML ---');
console.log($('#job-listings').html());
console.log('--- #newseventsx1 table HTML ---');
console.log($('#newseventsx1').html());

console.log('job-listings table exists:', $('#job-listings').length);
console.log('job-listings rows:', $('#job-listings tbody tr').length);
console.log('newseventsx1 table exists:', $('#newseventsx1').length);
console.log('newseventsx1 rows:', $('#newseventsx1 tbody tr').length);

// Scrape jobs
const jobs = [];
$('#job-listings tbody tr').each((i, el) => {
  const tds = $(el).find('td');
  console.log(`Job row ${i}:`, $(el).html());
  const company = $(tds[0]).text().trim();
  const deadline = $(tds[1]).text().trim();
  const postedOn = $(tds[2]).text().trim();
  const actionLinks = $(tds[3]).find('a');
  const updatesLink = actionLinks.eq(0).attr('href');
  const viewApplyLink = actionLinks.eq(1).attr('href');
  console.log(`Extracted: company=${company}, deadline=${deadline}, postedOn=${postedOn}, updatesLink=${updatesLink}, viewApplyLink=${viewApplyLink}`);
  if (viewApplyLink) {
    jobs.push({
      company,
      deadline,
      postedOn,
      updatesLink: updatesLink ? `https://tp.bitmesra.co.in/${updatesLink}` : null,
      viewApplyLink: `https://tp.bitmesra.co.in/${viewApplyLink}`
    });
  }
});

// Scrape notifications
const notifications = [];
$('#newseventsx1 tbody tr').each((i, el) => {
  console.log(`Notification row ${i}:`, $(el).html());
  const a = $(el).find('a').first();
  const title = a.text().trim();
  const link = a.attr('href') ? `https://tp.bitmesra.co.in/${a.attr('href')}` : '';
  const type = $(el).find('b.text-secondary').text().trim();
  const dateMatch = $(el).find('small').text().match(/Date.*?(\d{2}[-.\/]\d{2}[-.\/]\d{4}.*?IST|\d{2}[-.\/]\d{2}[-.\/]\d{4}.*?)/);
  const date = dateMatch ? dateMatch[1].replace('IST', '').trim() : '';
  console.log(`Extracted: title=${title}, type=${type}, date=${date}, link=${link}`);
  if (/job/i.test(type)) {
    notifications.push({ title, type, date, link });
  }
});

console.log('Jobs fetched:', jobs.length);
console.log(jobs);
console.log('Notifications fetched:', notifications.length);
console.log(notifications);

fs.writeFileSync('data/previous_jobs.json', JSON.stringify(jobs, null, 2));
fs.writeFileSync('data/previous_notifications.json', JSON.stringify(notifications, null, 2));