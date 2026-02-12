export interface EmailRecipient {
  email: string
  name?: string
}

export interface EmailMessage {
  to: EmailRecipient | EmailRecipient[]
  subject: string
  html: string
  text?: string
}

export interface IEmailService {
  send(
    message: EmailMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }>
  sendBatch(
    messages: EmailMessage[]
  ): Promise<{ success: boolean; sent: number; failed: number }>
}
