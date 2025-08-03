// src/auth.js
const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

async function login() {
  console.log('Attempting to log in...');
  const jar = new tough.CookieJar();
  const client = wrapper(axios.create({ jar })); // Disable automatic redirects

  const USERNAME = process.env.USERNAME;
  const PASSWORD = process.env.PASSWORD;
  const LOGIN_PAGE_URL = process.env.LOGIN_PAGE_URL;
  const TARGET_PAGE_URL = process.env.TARGET_PAGE_URL;

  const loginData = new URLSearchParams();
  loginData.append('identity', USERNAME);
  loginData.append('password', PASSWORD);
  loginData.append('submit', 'Login');

  try {
    // Post login data to the login page
    const loginResponse = await client.post(LOGIN_PAGE_URL, loginData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0', // Add User-Agent header
        'Referer': LOGIN_PAGE_URL     // Add Referer header
      },
      // Remove maxRedirects: 0 to allow redirects
    });

    console.log('Login POST status:', loginResponse.status);
    console.log('Login POST headers:', loginResponse.headers);

    // After the POST request, the cookie jar should contain the session cookie.
    // Now, try to access the protected page to verify the login.
    const protectedPageResponse = await client.get(TARGET_PAGE_URL);

    console.log('Protected page status:', protectedPageResponse.status);
    const protectedUrl = protectedPageResponse?.request?.res?.responseUrl;
    console.log('Protected page URL:', protectedUrl);

    // Check if the final URL is the protected page, not the login page.
    if (protectedUrl && protectedUrl.includes(TARGET_PAGE_URL)) {
      console.log('Login successful.');
      return client;
    } else {
      throw new Error('Login failed: Authentication credentials may be incorrect.');
    }
  } catch (error) {
    console.error('An error occurred during login:', error.message);
    throw new Error('Login failed: Authentication credentials may be incorrect.');
  }
}

module.exports = { login };