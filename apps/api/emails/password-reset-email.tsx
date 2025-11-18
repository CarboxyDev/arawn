import { Button, Link, Section, Text } from '@react-email/components';
import React from 'react';

import { EmailLayout } from './components/email-layout';

interface PasswordResetEmailProps {
  resetUrl: string;
  userEmail: string;
}

export default function PasswordResetEmail({
  resetUrl,
  userEmail,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your password" heading="Reset your password">
      <Text style={paragraph}>Hi there,</Text>
      <Text style={paragraph}>
        We received a request to reset the password for your account (
        <strong>{userEmail}</strong>).
      </Text>
      <Text style={paragraph}>
        Click the button below to reset your password:
      </Text>
      <Section style={buttonContainer}>
        <Button style={button} href={resetUrl}>
          Reset Password
        </Button>
      </Section>
      <Text style={paragraph}>
        Or copy and paste this URL into your browser:
      </Text>
      <Link href={resetUrl} style={link}>
        {resetUrl}
      </Link>
      <Text style={paragraph}>
        This password reset link will expire in 1 hour for security reasons.
      </Text>
      <Text style={paragraph}>
        If you didn't request a password reset, you can safely ignore this
        email. Your password will not be changed.
      </Text>
    </EmailLayout>
  );
}

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonContainer = {
  padding: '24px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const link = {
  color: '#3b82f6',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};
