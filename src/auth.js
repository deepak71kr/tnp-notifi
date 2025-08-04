// src/auth.js
const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

async function login() {
  console.log('Attempting to log in...');
  
  // Create a cookie jar to manage the session cookie
  const jar = new tough.CookieJar();
  const client = wrapper(axios.create({ jar, maxRedirects: 5 })); // Allow up to 5 redirects

  const USERNAME = process.env.USERNAME;
  const PASSWORD = process.env.PASSWORD;
  const LOGIN_PAGE_URL = process.env.LOGIN_PAGE_URL;
  const TARGET_PAGE_URL = process.env.TARGET_PAGE_URL;

  // Format the login data as URL-encoded key-value pairs
  const loginData = new URLSearchParams();
  loginData.append('identity', USERNAME);
  loginData.append('password', PASSWORD);
  loginData.append('submit', 'Login');

  try {
    // Step 1: Submit the login form via a POST request
    await client.post(LOGIN_PAGE_URL, loginData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Referer': LOGIN_PAGE_URL
      }
    });

    // Step 2: Access the protected page to verify the session cookie is working
    const protectedPageResponse = await client.get(TARGET_PAGE_URL);

    // Check if the final URL is the protected page, confirming successful login
    const finalUrl = protectedPageResponse.request.res.responseUrl;
    if (finalUrl && finalUrl.includes('index.html')) {
      console.log('Login successful. Session authenticated.');
      return client;
    } else {
      throw new Error('Login failed: Final URL is not the dashboard.');
    }
  } catch (error) {
    console.error('An error occurred during login:', error.message);
    throw new Error('Login failed: Authentication credentials may be incorrect.');
  }
}

module.exports = { login };