/**
 * Email template configuration.
 *
 * IMPORTANT: Update these values before deploying to production.
 * The logo must be hosted at a publicly accessible URL.
 */

export interface EmailConfig {
  appName: string;
  websiteUrl: string;
  supportEmail: string;
  primaryColor: string;
  logoUrl: string | undefined;
}

export const emailConfig: EmailConfig = {
  appName: 'Your App',
  websiteUrl: 'https://yourapp.com',
  supportEmail: 'support@yourapp.com',
  primaryColor: '#2563eb',
  logoUrl: undefined,
};
