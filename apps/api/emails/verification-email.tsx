import { Button, Link, Section, Text } from '@react-email/components';
import React from 'react';

import { EmailLayout } from './components/email-layout';

interface VerificationEmailProps {
  verificationUrl: string;
  userEmail: string;
}

export default function VerificationEmail({
  verificationUrl,
  userEmail,
}: VerificationEmailProps) {
  return (
    <EmailLayout
      preview="Verify your email address to complete registration"
      heading="Verify your email address"
    >
      <Text style={paragraph}>Hi there,</Text>
      <Text style={paragraph}>
        Thanks for signing up! We need to verify your email address (
        <strong>{userEmail}</strong>) to complete your registration.
      </Text>
      <Text style={paragraph}>
        Click the button below to verify your email address:
      </Text>
      <Section style={buttonContainer}>
        <Button style={button} href={verificationUrl}>
          Verify Email Address
        </Button>
      </Section>
      <Text style={paragraph}>
        Or copy and paste this URL into your browser:
      </Text>
      <Link href={verificationUrl} style={link}>
        {verificationUrl}
      </Link>
      <Text style={paragraph}>
        This verification link will expire in 24 hours for security reasons.
      </Text>
      <Text style={paragraph}>
        If you didn't create an account, you can safely ignore this email.
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
