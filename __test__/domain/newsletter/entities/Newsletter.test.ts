import { describe, it, expect } from "vitest"
import { Newsletter } from "@/domain/newsletter/entities/Newsletter"
import { NewsletterSection } from "@/domain/newsletter/entities/NewsletterSection"

function makeSection(order = 1) {
  return NewsletterSection.create({
    type: "member_announcements",
    title: "Section Title",
    content: "Section Content",
    order,
  })
}

function makeNewsletter(sections?: NewsletterSection[]) {
  return Newsletter.create({
    edition: 1,
    title: "Test Newsletter",
    sections: sections ?? [makeSection()],
  })
}

describe("Newsletter", () => {
  it("should create with draft status", () => {
    const nl = makeNewsletter()
    expect(nl.status).toBe("draft")
    expect(nl.isDraft).toBe(true)
    expect(nl.isPublished).toBe(false)
    expect(nl.publishedAt).toBeNull()
    expect(nl.edition).toBe(1)
    expect(nl.title).toBe("Test Newsletter")
    expect(nl.sections).toHaveLength(1)
  })

  it("should publish a draft newsletter", () => {
    const nl = makeNewsletter()
    nl.publish()
    expect(nl.status).toBe("published")
    expect(nl.isPublished).toBe(true)
    expect(nl.publishedAt).toBeInstanceOf(Date)
  })

  it("should throw when publishing already published", () => {
    const nl = makeNewsletter()
    nl.publish()
    expect(() => nl.publish()).toThrow("already published")
  })

  it("should throw when publishing with no sections", () => {
    const nl = makeNewsletter([])
    expect(() => nl.publish()).toThrow("at least one section")
  })

  it("should update title when draft", () => {
    const nl = makeNewsletter()
    nl.updateTitle("New Title")
    expect(nl.title).toBe("New Title")
  })

  it("should throw when updating title of published", () => {
    const nl = makeNewsletter()
    nl.publish()
    expect(() => nl.updateTitle("New")).toThrow("Cannot edit published")
  })

  it("should add section when draft", () => {
    const nl = makeNewsletter()
    nl.addSection(makeSection(2))
    expect(nl.sections).toHaveLength(2)
  })

  it("should throw when adding section to published", () => {
    const nl = makeNewsletter()
    nl.publish()
    expect(() => nl.addSection(makeSection(2))).toThrow("Cannot edit published")
  })

  it("should remove section when draft", () => {
    const section = makeSection()
    const nl = makeNewsletter([section])
    nl.removeSection(section.id)
    expect(nl.sections).toHaveLength(0)
  })

  it("should throw when removing section from published", () => {
    const section = makeSection()
    const nl = makeNewsletter([section])
    nl.publish()
    expect(() => nl.removeSection(section.id)).toThrow("Cannot edit published")
  })

  it("should serialize to primitives", () => {
    const nl = makeNewsletter()
    const p = nl.toPrimitives()
    expect(p.edition).toBe(1)
    expect(p.title).toBe("Test Newsletter")
    expect(p.status).toBe("draft")
    expect(p.sections).toHaveLength(1)
    expect(p.sections[0].type).toBe("member_announcements")
  })
})
