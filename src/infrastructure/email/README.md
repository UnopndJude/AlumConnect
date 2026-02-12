# Email Service Infrastructure

This directory contains the email service implementation for AlumConnect, supporting newsletter distribution and other email communications.

## Architecture

The email service follows the repository pattern with a domain interface (`IEmailService`) and multiple implementations.

### Domain Layer

- **IEmailService** (`src/domain/email/services/IEmailService.ts`): Interface defining email operations
  - `send(message: EmailMessage)`: Send a single email
  - `sendBatch(messages: EmailMessage[])`: Send multiple emails

### Infrastructure Layer

#### Implementations

1. **ResendEmailService** (`ResendEmailService.ts`)

   - Production email service using [Resend](https://resend.com)
   - Requires `RESEND_API_KEY` environment variable
   - Handles errors gracefully with detailed error messages

2. **ConsoleEmailService** (`ConsoleEmailService.ts`)
   - Development/testing email service
   - Logs emails to console instead of sending
   - Useful for local development without external dependencies

#### Templates

**Newsletter Template** (`templates/newsletter.ts`)

Generates HTML and plain text emails from Newsletter entities:

- `generateNewsletterHtml(newsletter, options)`: Creates formatted HTML email
- `generateNewsletterText(newsletter)`: Creates plain text version

Features:

- Professional email design with inline styles
- Proper Korean date formatting
- Section ordering and categorization
- Unsubscribe link support
- Mobile-responsive layout

## Usage

### Getting Email Service from DI Container

```typescript
import { container } from "@/infrastructure/di/container"

const emailService = container.getEmailService()
```

The container automatically returns:

- `ResendEmailService` if `RESEND_API_KEY` is set
- `ConsoleEmailService` otherwise

### Sending a Single Email

```typescript
const result = await emailService.send({
  to: { email: "user@example.com", name: "User Name" },
  subject: "Welcome to AlumConnect",
  html: "<p>Welcome email content</p>",
  text: "Welcome email content",
})

if (result.success) {
  console.log("Email sent:", result.messageId)
} else {
  console.error("Email failed:", result.error)
}
```

### Sending Newsletter

```typescript
import {
  generateNewsletterHtml,
  generateNewsletterText,
} from "@/infrastructure/email/templates/newsletter"

const newsletter = await newsletterRepository.findById(id)

const html = generateNewsletterHtml(newsletter, {
  unsubscribeToken: subscription.token,
  baseUrl: "https://alumconnect.com",
})

const text = generateNewsletterText(newsletter)

await emailService.send({
  to: { email: subscription.email },
  subject: newsletter.title,
  html,
  text,
})
```

### Batch Sending

```typescript
const messages = subscriptions.map((sub) => ({
  to: { email: sub.email },
  subject: newsletter.title,
  html: generateNewsletterHtml(newsletter, {
    unsubscribeToken: sub.token,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  }),
  text: generateNewsletterText(newsletter),
}))

const result = await emailService.sendBatch(messages)
console.log(`Sent: ${result.sent}, Failed: ${result.failed}`)
```

## Environment Variables

- `RESEND_API_KEY`: API key for Resend service (optional, uses ConsoleEmailService if not set)

## Testing

Tests are located in `__test__/infrastructure/email/`:

- `EmailService.test.ts`: Tests for ConsoleEmailService
- `templates/newsletter.test.ts`: Tests for email template generation
- `di/container-email.test.ts`: Tests for DI container integration

Run tests:

```bash
pnpm test __test__/infrastructure/email
```

## Adding New Email Templates

1. Create a new template file in `templates/`
2. Export functions that generate HTML and text versions
3. Follow the newsletter template pattern for consistency
4. Include proper styling and mobile responsiveness
5. Add corresponding tests

Example:

```typescript
// templates/welcome.ts
export function generateWelcomeHtml(user: User): string {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Welcome, ${user.name}!</h1>
        <p>Thanks for joining AlumConnect.</p>
      </body>
    </html>
  `
}

export function generateWelcomeText(user: User): string {
  return `Welcome, ${user.name}!\n\nThanks for joining AlumConnect.`
}
```

## Email Design Guidelines

- Use inline styles for compatibility
- Ensure mobile responsiveness
- Include plain text version for accessibility
- Keep HTML simple (tables for layout)
- Test with multiple email clients
- Include unsubscribe links where required
- Use Korean formatting for dates and text
