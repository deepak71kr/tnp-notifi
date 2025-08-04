# T&P Job Portal Scraper

A Node.js web scraping application that monitors the T&P (Training & Placement) job portal for new job listings and notifications, with email notifications and MongoDB data storage.

## Features

- Automated web scraping of job portal
- Email notifications for new job listings and notifications
- MongoDB data storage for persistence
- GitHub Actions deployment for automated monitoring
- Robust error handling and connection management

## Environment Variables

The following environment variables are required:

- `USERNAME`: Portal login username
- `PASSWORD`: Portal login password
- `LOGIN_PAGE_URL`: Login page URL
- `TARGET_PAGE_URL`: Target page URL to scrape
- `CHECK_INTERVAL_MINUTES`: Check interval in minutes (default: 30)
- `EMAIL_SERVICE`: Email service (e.g., gmail)
- `EMAIL_USER`: Email username
- `EMAIL_PASS`: Email password
- `RECIPIENT_EMAILS`: Comma-separated list of recipient emails
- `MONGO_URI`: MongoDB connection string

## GitHub Actions Deployment

The application is configured to run automatically via GitHub Actions:

- **Schedule**: Runs every 10 minutes
- **Manual Trigger**: Can be triggered manually from GitHub Actions tab
- **Concurrency**: Prevents multiple runs from overlapping

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in a `.env` file

3. Initialize the database:
   ```bash
   npm run init
   ```

4. Start monitoring:
   ```bash
   npm start
   ```

## Project Structure

- `src/` - Source code modules
  - `auth.js` - Authentication handling
  - `contentProcessor.js` - Content parsing and comparison
  - `dataManager.js` - MongoDB data operations
  - `notificationSender.js` - Email notification system
  - `pageScraper.js` - Web page scraping
- `initialize.js` - Database initialization script
- `index.js` - Main monitoring script
- `.github/workflows/` - GitHub Actions configuration

## Error Handling

The application includes robust error handling for:
- Network connection issues (ECONNRESET, ESOCKET)
- Email authentication failures
- Database connection problems
- Web scraping errors

All errors are logged but don't crash the application, ensuring continuous monitoring. 