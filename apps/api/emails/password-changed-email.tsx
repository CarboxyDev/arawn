import { Button, Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout } from './components/email-layout';
import { emailConfig } from './config';

interface PasswordChangedEmailProps {
  userEmail: string;
  changedAt: string;
  resetPasswordUrl: string;
}

export default function PasswordChangedEmail({
  userEmail = 'user@example.com',
  changedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }),
  resetPasswordUrl = 'https://yourapp.com/forgot-password',
}: PasswordChangedEmailProps) {
  const { appName } = emailConfig;

  return (
    <EmailLayout
      preview={`Your ${appName} password was changed`}
      heading="Your password was changed"
    >
      <Text style={paragraph}>
        The password for your account (<strong>{userEmail}</strong>) was
        successfully changed on {changedAt}.
      </Text>

      <Text style={paragraph}>
        If you made this change, no further action is required.
      </Text>

      <Text style={warningText}>
        If you didn't change your password, your account may be compromised.
        Reset your password immediately:
      </Text>

      <Button style={dangerButton} href={resetPasswordUrl}>
        Reset Password
      </Button>

      <Text style={paragraphSmall}>
        For security, this email was sent to notify you of account changes.
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

const warningText: React.CSSProperties = {
  color: '#b45309',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 24px',
  padding: '16px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  border: '1px solid #fcd34d',
};

const paragraphSmall: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '24px 0 0',
};

const dangerButton: React.CSSProperties = {
  borderRadius: '8px',
  backgroundColor: '#dc2626',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '12px 32px',
};
