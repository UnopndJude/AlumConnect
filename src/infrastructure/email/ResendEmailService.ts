import { Resend } from "resend"
import {
  IEmailService,
  EmailMessage,
  EmailRecipient,
} from "@/domain/email/services/IEmailService"

export class ResendEmailService implements IEmailService {
  private resend: Resend

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }
    this.resend = new Resend(apiKey)
  }

  async send(
    message: EmailMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const recipients = Array.isArray(message.to) ? message.to : [message.to]

      const { data, error } = await this.resend.emails.send({
        from: "AlumConnect <newsletter@alumconnect.com>",
        to: recipients.map(this.formatRecipient),
        subject: message.subject,
        html: message.html,
        text: message.text,
      })

      if (error) {
        return {
          success: false,
          error: error.message || "Failed to send email",
        }
      }

      return {
        success: true,
        messageId: data?.id,
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  async sendBatch(
    messages: EmailMessage[]
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    let sent = 0
    let failed = 0

    for (const message of messages) {
      const result = await this.send(message)
      if (result.success) {
        sent++
      } else {
        failed++
      }
    }

    return {
      success: failed === 0,
      sent,
      failed,
    }
  }

  private formatRecipient(recipient: EmailRecipient): string {
    if (recipient.name) {
      return `${recipient.name} <${recipient.email}>`
    }
    return recipient.email
  }
}
