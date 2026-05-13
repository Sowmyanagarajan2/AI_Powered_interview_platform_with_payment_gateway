// googleAuth.js
// Utility to verify Google OAuth token

const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload(); //Data section inside JWT token that contains user info
    return payload;
  } catch (error) {
    throw new Error('Invalid Google token');
  }
}

module.exports = { verifyGoogleToken };
