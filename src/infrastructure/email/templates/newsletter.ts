import { Newsletter } from "@/domain/newsletter/entities/Newsletter"

interface NewsletterTemplateOptions {
  unsubscribeToken: string
  baseUrl: string
}

export function generateNewsletterHtml(
  newsletter: Newsletter,
  options: NewsletterTemplateOptions
): string {
  const { unsubscribeToken, baseUrl } = options
  const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`

  const sectionsHtml = newsletter.sections
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const sectionTitle = getSectionTitle(section.type)
      return `
        <div style="margin-bottom: 32px;">
          <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin-bottom: 12px;">
            ${sectionTitle}
          </h2>
          <h3 style="color: #374151; font-size: 16px; font-weight: 500; margin-bottom: 8px;">
            ${section.title}
          </h3>
          <div style="color: #4b5563; font-size: 14px; line-height: 1.6;">
            ${formatContent(section.content)}
          </div>
        </div>
      `
    })
    .join("")

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsletter.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 2px solid #e5e7eb;">
              <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">
                AlumConnect Newsletter
              </h1>
              <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">
                제 ${newsletter.edition}호 - ${formatDate(newsletter.publishedAt || new Date())}
              </p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="margin: 0; color: #111827; font-size: 28px; font-weight: 700;">
                ${newsletter.title}
              </h2>
            </td>
          </tr>

          <!-- Content Sections -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              ${sectionsHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                인천과학고등학교 동문회 AlumConnect
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                <a href="${unsubscribeUrl}" style="color: #3b82f6; text-decoration: underline;">
                  수신거부
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export function generateNewsletterText(newsletter: Newsletter): string {
  const sections = newsletter.sections
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const sectionTitle = getSectionTitle(section.type)
      return `
${sectionTitle}
${"=".repeat(sectionTitle.length)}

${section.title}

${stripHtml(section.content)}
      `.trim()
    })
    .join("\n\n")

  return `
AlumConnect Newsletter - 제 ${newsletter.edition}호
${formatDate(newsletter.publishedAt || new Date())}

${newsletter.title}
${"=".repeat(newsletter.title.length)}

${sections}

---
인천과학고등학교 동문회 AlumConnect
수신거부: {unsubscribeUrl}
  `.trim()
}

function getSectionTitle(type: string): string {
  const titles: Record<string, string> = {
    alumni_in_media: "동문 소식",
    member_announcements: "회원 공지",
    industry_trends: "업계 동향",
  }
  return titles[type] || type
}

function formatContent(content: string): string {
  // Convert simple markdown-like formatting to HTML
  const formatted = content
    .replace(/\n\n/g, "</p><p style='margin: 0 0 12px 0;'>")
    .replace(/\n/g, "<br>")

  return `<p style="margin: 0 0 12px 0;">${formatted}</p>`
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}년 ${month}월 ${day}일`
}
