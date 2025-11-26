import { Button, Text } from '@react-email/components';
import * as React from 'react';

import { EmailLayout } from './components/email-layout';
import { emailConfig } from './config';

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export default function WelcomeEmail({
  userName = 'there',
  dashboardUrl = 'https://yourapp.com/dashboard',
}: WelcomeEmailProps) {
  const { appName, primaryColor } = emailConfig;

  return (
    <EmailLayout
      preview={`Welcome to ${appName}! Your account is ready.`}
      heading={`Welcome to ${appName}!`}
    >
      <Text style={paragraph}>Hi {userName},</Text>

      <Text style={paragraph}>
        Your email has been verified and your account is all set up. We're
        excited to have you on board.
      </Text>

      <Text style={paragraph}>Get started by exploring your dashboard:</Text>

      <Button
        style={{ ...button, backgroundColor: primaryColor }}
        href={dashboardUrl}
      >
        Go to Dashboard
      </Button>

      <Text style={paragraphSmall}>
        If you have any questions, just reply to this email — we're here to
        help.
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
