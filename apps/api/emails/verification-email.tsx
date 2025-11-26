import { Button, Link, Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout } from './components/email-layout';
import { emailConfig } from './config';

interface VerificationEmailProps {
  verificationUrl: string;
  userEmail: string;
}

export default function VerificationEmail({
  verificationUrl = 'https://example.com/verify?token=abc123',
  userEmail = 'user@example.com',
}: VerificationEmailProps) {
  const { appName, primaryColor } = emailConfig;

  return (
    <EmailLayout
      preview={`Verify your email to get started with ${appName}`}
      heading="Verify your email"
    >
      <Text style={paragraph}>
        Thanks for signing up! Please verify your email address (
        <strong>{userEmail}</strong>) to complete your registration.
      </Text>

      <Button
        style={{ ...button, backgroundColor: primaryColor }}
        href={verificationUrl}
      >
        Verify Email Address
      </Button>

      <Text style={paragraphMuted}>Or copy this link into your browser:</Text>
      <Link href={verificationUrl} style={link}>
        {verificationUrl}
      </Link>

      <Text style={paragraphSmall}>
        This link expires in 24 hours. If you didn't create an account, ignore
        this email.
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
