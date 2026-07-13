import { SignJWT, importPKCS8 } from 'jose';

type NotificationType = 'URL_UPDATED' | 'URL_DELETED';

/**
 * Sends a notification to the Google Indexing API.
 * Uses environment variables GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY.
 * Safe to run on Edge runtime.
 */
export async function notifyGoogleIndexing(url: string, type: NotificationType = 'URL_UPDATED'): Promise<boolean> {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    let privateKeyEnv = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKeyEnv) {
      console.warn('Google Indexing API configuration missing. Skipping notification.');
      return false;
    }

    // Fix escaped newlines in the private key if necessary
    privateKeyEnv = privateKeyEnv.replace(/\\n/g, '\n');

    // 1. Import private key for jose
    const privateKey = await importPKCS8(privateKeyEnv, 'RS256');

    // 2. Sign JWT
    const jwt = await new SignJWT({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
      iat: Math.floor(Date.now() / 1000),
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .sign(privateKey);

    // 3. Exchange JWT for an Access Token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to get Google Access Token:', errorText);
      return false;
    }

    const { access_token } = await tokenResponse.json();

    // 4. Send the notification to the Indexing API
    const notifyResponse = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        url,
        type,
      }),
    });

    if (!notifyResponse.ok) {
      const errorText = await notifyResponse.text();
      console.error('Google Indexing API error:', errorText);
      return false;
    }

    console.log(`Google Indexing API Success: ${type} for ${url}`);
    return true;
  } catch (error) {
    console.error('Error notifying Google Indexing API:', error);
    return false;
  }
}
