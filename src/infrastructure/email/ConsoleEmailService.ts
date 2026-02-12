import {
  IEmailService,
  EmailMessage,
  EmailRecipient,
} from "@/domain/email/services/IEmailService"

export class ConsoleEmailService implements IEmailService {
  async send(
    message: EmailMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const recipients = Array.isArray(message.to) ? message.to : [message.to]

    console.log("\n=== EMAIL SENT (CONSOLE MODE) ===")
    console.log("To:", recipients.map(this.formatRecipient).join(", "))
    console.log("Subject:", message.subject)
    console.log("Text:", message.text || "(no text version)")
    console.log("HTML length:", message.html.length, "characters")
    console.log("HTML preview:", message.html.substring(0, 200) + "...")
    console.log("================================\n")

    return {
      success: true,
      messageId: `console-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  async sendBatch(
    messages: EmailMessage[]
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    console.log(
      `\n=== BATCH EMAIL SEND (CONSOLE MODE) - ${messages.length} messages ===`
    )

    for (let i = 0; i < messages.length; i++) {
      console.log(`\nMessage ${i + 1}/${messages.length}:`)
      await this.send(messages[i])
    }

    console.log("=== BATCH COMPLETE ===\n")

    return {
      success: true,
      sent: messages.length,
      failed: 0,
    }
  }

  private formatRecipient(recipient: EmailRecipient): string {
    if (recipient.name) {
      return `${recipient.name} <${recipient.email}>`
    }
    return recipient.email
  }
}
