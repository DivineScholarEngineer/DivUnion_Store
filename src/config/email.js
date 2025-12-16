export const ADMIN_EMAIL_CONFIG = {
  address: process.env.GATSBY_ADMIN_EMAIL_ADDRESS || 'YOUR_EMAIL_HERE',
  appPassword: process.env.GATSBY_ADMIN_EMAIL_APP_PASSWORD || 'YOUR_APP_PASSWORD_HERE',
};

export const EMAIL_DELIVERY_NOTES =
  'Use the main admin email credentials to deliver one-time codes. Update the placeholders via env vars when deploying.';
