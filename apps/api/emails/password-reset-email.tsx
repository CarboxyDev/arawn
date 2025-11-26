import { Button, Link, Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout } from './components/email-layout';
import { emailConfig } from './config';

interface PasswordResetEmailProps {
  resetUrl: string;
  userEmail: string;
}

export default function PasswordResetEmail({
  resetUrl = 'https://example.com/reset-password?token=abc123',
  userEmail = 'user@example.com',
}: PasswordResetEmailProps) {
  const { primaryColor } = emailConfig;

  return (
    <EmailLayout preview="Reset your password" heading="Reset your password">
      <Text style={paragraph}>
        We received a request to reset the password for{' '}
        <strong>{userEmail}</strong>.
      </Text>

      <Text style={paragraph}>
        Click the button below to choose a new password:
      </Text>

      <Button
        style={{ ...button, backgroundColor: primaryColor }}
        href={resetUrl}
      >
        Reset Password
      </Button>

      <Text style={paragraphMuted}>Or copy this link into your browser:</Text>
      <Link href={resetUrl} style={link}>
        {resetUrl}
      </Link>

      <Text style={paragraphSmall}>
        This link expires in 1 hour. If you didn't request this, you can safely
        ignore this email — your password won't be changed.
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

const paragraphMuted: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '24px 0 8px',
};

const paragraphSmall: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '24px 0 0',
};

const button: React.CSSProperties = {
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '12px 32px',
};

const link: React.CSSProperties = {
  color: '#2563eb',
  fontSize: '13px',
  textDecoration: 'underline',
  wordBreak: 'break-all',
};
