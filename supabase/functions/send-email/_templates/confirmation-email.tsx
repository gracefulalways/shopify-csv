
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ConfirmEmailProps {
  confirmationUrl: string;
  email: string;
}

export const ConfirmationEmail = ({
  confirmationUrl,
  email,
}: ConfirmEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirm your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to ShopifyCSV.app!</Heading>
        <Text style={text}>
          Thank you for signing up! Please confirm your email address ({email}) to get started.
        </Text>
        <Link
          href={confirmationUrl}
          target="_blank"
          style={{
            ...link,
            display: 'block',
            marginBottom: '16px',
          }}
        >
          Click here to confirm your email address
        </Link>
        <Text style={footer}>
          If you didn't create an account with ShopifyCSV.app, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ConfirmationEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#000',
  fontSize: '24px',
  fontWeight: 'normal',
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '0',
}

const text = {
  color: '#000',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#000',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
}

const link = {
  color: '#067df7',
  textDecoration: 'underline',
}

const footer = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '20px',
  marginTop: '12px',
  marginBottom: '24px',
}
