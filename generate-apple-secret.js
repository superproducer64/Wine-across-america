/**
 * Generates the Apple client secret JWT required by Supabase.
 * Fill in the four values below, then run:  node generate-apple-secret.js
 */

const jwt = require('jsonwebtoken');

// ── Fill these in ──────────────────────────────────────────────────────────────

const TEAM_ID    = 'XXXXXXXXXX';        // 10-char Team ID from developer.apple.com (top-right)
const KEY_ID     = 'XXXXXXXXXX';        // 10-char Key ID from developer.apple.com → Keys
const CLIENT_ID  = 'com.your.siwa';     // Services ID identifier (e.g. com.yourapp.siwa)

// Paste the full contents of your .p8 file between the backticks below
// (include the -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY----- lines)
const PRIVATE_KEY = `
-----BEGIN PRIVATE KEY-----
PASTE YOUR .P8 KEY CONTENTS HERE
-----END PRIVATE KEY-----
`;

// ── Do not edit below this line ────────────────────────────────────────────────

if (
  TEAM_ID === 'XXXXXXXXXX' ||
  KEY_ID === 'XXXXXXXXXX' ||
  CLIENT_ID === 'com.your.siwa' ||
  PRIVATE_KEY.includes('PASTE YOUR')
) {
  console.error('❌  Please fill in all four values at the top of this file first.');
  process.exit(1);
}

const now = Math.floor(Date.now() / 1000);

const token = jwt.sign(
  {
    iss: TEAM_ID,
    iat: now,
    exp: now + 86400 * 180,   // 180 days — Apple's maximum
    aud: 'https://appleid.apple.com',
    sub: CLIENT_ID,
  },
  PRIVATE_KEY.trim(),
  {
    algorithm: 'ES256',
    header: { alg: 'ES256', kid: KEY_ID },
  }
);

console.log('\n✅  Your Apple client secret JWT (paste this into Supabase):\n');
console.log(token);
console.log('\n⚠️  Delete this file and your .p8 key from the project once done.\n');
