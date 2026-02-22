import { describe, it, expect } from "vitest"
import { Announcement } from "@/domain/announcement/entities/Announcement"

describe("Announcement", () => {
  function makeAnnouncement() {
    return Announcement.create({
      authorId: "author-1",
      type: "member_announcements",
      title: "Test Title",
      content: "Test Content",
    })
  }

  it("should create with pending status", () => {
    const ann = makeAnnouncement()
    expect(ann.status).toBe("pending")
    expect(ann.isPending).toBe(true)
    expect(ann.isApproved).toBe(false)
    expect(ann.isRejected).toBe(false)
    expect(ann.reviewedBy).toBeNull()
    expect(ann.reviewedAt).toBeNull()
    expect(ann.rejectionReason).toBeNull()
  })

  it("should have correct properties", () => {
    const ann = makeAnnouncement()
    expect(ann.authorId).toBe("author-1")
    expect(ann.type).toBe("member_announcements")
    expect(ann.title).toBe("Test Title")
    expect(ann.content).toBe("Test Content")
    expect(ann.id).toBeDefined()
    expect(ann.createdAt).toBeInstanceOf(Date)
  })

  it("should approve a pending announcement", () => {
    const ann = makeAnnouncement()
    ann.approve("admin-1")
    expect(ann.status).toBe("approved")
    expect(ann.isApproved).toBe(true)
    expect(ann.reviewedBy).toBe("admin-1")
    expect(ann.reviewedAt).toBeInstanceOf(Date)
    expect(ann.rejectionReason).toBeNull()
  })

  it("should reject a pending announcement with reason", () => {
    const ann = makeAnnouncement()
    ann.reject("admin-1", "Inappropriate content")
    expect(ann.status).toBe("rejected")
    expect(ann.isRejected).toBe(true)
    expect(ann.reviewedBy).toBe("admin-1")
    expect(ann.rejectionReason).toBe("Inappropriate content")
  })

  it("should throw when approving non-pending", () => {
    const ann = makeAnnouncement()
    ann.approve("admin")
    expect(() => ann.approve("admin")).toThrow(
      "Only pending announcements can be approved"
    )
  })

  it("should throw when rejecting non-pending", () => {
    const ann = makeAnnouncement()
    ann.approve("admin")
    expect(() => ann.reject("admin", "reason")).toThrow(
      "Only pending announcements can be rejected"
    )
  })

  it("should throw when rejecting without reason", () => {
    const ann = makeAnnouncement()
    expect(() => ann.reject("admin", "")).toThrow(
      "Rejection reason is required"
    )
  })

  it("should throw when rejecting with whitespace-only reason", () => {
    const ann = makeAnnouncement()
    expect(() => ann.reject("admin", "   ")).toThrow(
      "Rejection reason is required"
    )
  })

  it("should check canBeDeletedBy", () => {
    const ann = makeAnnouncement()
    expect(ann.canBeDeletedBy("author-1")).toBe(true)
    expect(ann.canBeDeletedBy("other")).toBe(false)

    ann.approve("admin")
    expect(ann.canBeDeletedBy("author-1")).toBe(false)
  })

  it("should return defensive copy of reviewedAt", () => {
    const ann = makeAnnouncement()
    expect(ann.reviewedAt).toBeNull()
    ann.approve("admin")
    const d1 = ann.reviewedAt
    const d2 = ann.reviewedAt
    expect(d1!.getTime()).toBe(d2!.getTime())
    expect(d1).not.toBe(d2)
  })

  it("should reconstitute from primitives", () => {
    const ann = Announcement.fromPrimitives({
      id: "ann-id",
      authorId: "a",
      type: "alumni_in_media",
      title: "T",
      content: "C",
      status: "approved",
      reviewedBy: "admin",
      reviewedAt: new Date(),
      rejectionReason: null,
      createdAt: new Date(),
    })
    expect(ann.id).toBe("ann-id")
    expect(ann.isApproved).toBe(true)
  })

  it("should serialize to primitives", () => {
    const ann = makeAnnouncement()
    const p = ann.toPrimitives()
    expect(p.authorId).toBe("author-1")
    expect(p.type).toBe("member_announcements")
    expect(p.title).toBe("Test Title")
    expect(p.status).toBe("pending")
  })
})
