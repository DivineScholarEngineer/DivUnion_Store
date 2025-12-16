export const ADMIN_EMAIL_CONFIG = {
  address: process.env.GATSBY_ADMIN_EMAIL_ADDRESS || 'divinewos@gmail.com',
  appPassword: process.env.GATSBY_ADMIN_EMAIL_APP_PASSWORD || '',
};

export const EMAIL_DELIVERY_NOTES =
  'Use the main admin email credentials to deliver one-time codes. Update the placeholders via env vars when deploying.';
