import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

import { emailConfig } from '../config';

interface EmailLayoutProps {
  preview: string;
  heading: string;
  children: React.ReactNode;
  showFooterLinks?: boolean;
}

export function EmailLayout({
  preview,
  heading,
  children,
  showFooterLinks = true,
}: EmailLayoutProps) {
  const { appName, logoUrl, primaryColor, supportEmail } = emailConfig;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            {logoUrl ? (
              <Img src={logoUrl} width="48" height="48" alt={appName} />
            ) : (
              <Text style={{ ...logoText, color: primaryColor }}>
                {appName}
              </Text>
            )}
          </Section>

          <Section style={contentSection}>
            <Heading style={h1}>{heading}</Heading>
            {children}
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            {showFooterLinks && (
              <Text style={footerLinks}>
                <Link href={`mailto:${supportEmail}`} style={footerLink}>
                  Contact Support
                </Link>
              </Text>
            )}
            <Text style={footerText}>
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </Text>
            <Text style={footerMuted}>
              If you didn't expect this email, you can safely ignore it.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: '40px 0',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '560px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
};

const logoSection: React.CSSProperties = {
  padding: '32px 40px 24px',
  textAlign: 'center',
};

const logoText: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '-0.5px',
};

const contentSection: React.CSSProperties = {
  padding: '0 40px 32px',
};

const h1: React.CSSProperties = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '0 0 24px',
  letterSpacing: '-0.25px',
};

const hr: React.CSSProperties = {
  borderColor: '#e2e8f0',
  borderTop: 'none',
  margin: '0',
};

const footer: React.CSSProperties = {
  padding: '24px 40px',
  backgroundColor: '#f8fafc',
};

const footerLinks: React.CSSProperties = {
  textAlign: 'center',
  margin: '0 0 16px',
};

const footerLink: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  textDecoration: 'underline',
};

const footerText: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '0 0 8px',
};

const footerMuted: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '18px',
  textAlign: 'center',
  margin: '0',
};
