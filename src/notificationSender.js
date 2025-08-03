// src/notificationSender.js
const nodemailer = require('nodemailer');
require('dotenv').config({ override: true });

const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const RECIPIENT_EMAILS = process.env.RECIPIENT_EMAILS ? process.env.RECIPIENT_EMAILS.split(',') : [];

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

function createHtmlEmail(subject, newEntries) {
  let html = `<h1>${subject}</h1>`;

  if (subject === 'Initial Scrape Complete') {
    html += `<p>Your web scraper has been successfully initialized and is ready to monitor the portal. The following is the current content found on the page. You will be notified when new updates are posted.</p>`;
  }

  if (newEntries.jobs && newEntries.jobs.length > 0) {
    html += `<h2>Jobs Found (${newEntries.jobs.length}):</h2>`;
    html += `<table style="width:100%; border-collapse: collapse;">`;
    html += `<thead><tr><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Company</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Deadline</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Posted On</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Link</th></tr></thead>`;
    html += `<tbody>`;
    newEntries.jobs.forEach(job => {
      html += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${job.company}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${job.deadline}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${job.postedDate}</td>
          <td style="border: 1px solid #ddd; padding: 8px;"><a href="${job.link}">View Details</a></td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
  } else if (subject !== 'Initial Scrape Complete') {
    html += `<p>No new jobs found.</p>`;
  }

  if (newEntries.notifications && newEntries.notifications.length > 0) {
    html += `<h2>Notifications Found (${newEntries.notifications.length}):</h2>`;
    html += `<table style="width:100%; border-collapse: collapse;">`;
    html += `<thead><tr><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Title</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Type</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Link</th></tr></thead>`;
    html += `<tbody>`;
    newEntries.notifications.forEach(notification => {
      html += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${notification.title}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${notification.type}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${notification.date}</td>
          <td style="border: 1px solid #ddd; padding: 8px;"><a href="${notification.link}">View Details</a></td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
  } else if (subject !== 'Initial Scrape Complete') {
    html += `<p>No new notifications found.</p>`;
  }

  return html;
}

async function sendNotification(subject, newEntries) {
  if (RECIPIENT_EMAILS.length === 0) {
    console.warn('No recipient emails configured. Skipping email notification.');
    return;
  }

  const mailOptions = {
    from: EMAIL_USER,
    to: RECIPIENT_EMAILS.join(','),
    subject: subject,
    html: createHtmlEmail(subject, newEntries),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent successfully to ${RECIPIENT_EMAILS.length} recipient(s).`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = { sendNotification };