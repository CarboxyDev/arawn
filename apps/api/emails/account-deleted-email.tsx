import { Link, Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout } from './components/email-layout';
import { emailConfig } from './config';

interface AccountDeletedEmailProps {
  userEmail: string;
  deletedAt: string;
}

export default function AccountDeletedEmail({
  userEmail = 'user@example.com',
  deletedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }),
}: AccountDeletedEmailProps) {
  const { appName, supportEmail } = emailConfig;

  return (
    <EmailLayout
      preview={`Your ${appName} account has been deleted`}
      heading="Account deleted"
    >
      <Text style={paragraph}>
        Your account (<strong>{userEmail}</strong>) has been permanently deleted
        on {deletedAt}.
      </Text>

      <Text style={paragraph}>
        All your data has been removed from our systems. This action cannot be
        undone.
      </Text>

      <Text style={paragraph}>
        If you didn't request this deletion or believe this was done in error,
        please contact us immediately at{' '}
        <Link href={`mailto:${supportEmail}`} style={link}>
          {supportEmail}
        </Link>
        .
      </Text>

      <Text style={paragraphSmall}>
        Thank you for being part of {appName}. We're sorry to see you go.
      </Text>
    </EmailLayout>
  );
}

const paragraph: React.CSSProperties = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 24px',
};

const paragraphSmall: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '24px 0 0',
};

const link: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'underline',
};
