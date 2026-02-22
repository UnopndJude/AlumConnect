import { describe, it, expect } from "vitest"
import { Connection } from "@/domain/connection/entities/Connection"
import { ConnectionId } from "@/domain/connection/value-objects"

describe("Connection", () => {
  it("should create a pending connection", () => {
    const conn = Connection.create({
      requesterId: "user-a",
      receiverId: "user-b",
      message: "Let's connect!",
    })
    expect(conn.requesterId).toBe("user-a")
    expect(conn.receiverId).toBe("user-b")
    expect(conn.message).toBe("Let's connect!")
    expect(conn.status).toBe("pending")
    expect(conn.isPending).toBe(true)
    expect(conn.isAccepted).toBe(false)
    expect(conn.isRejected).toBe(false)
    expect(conn.respondedAt).toBeNull()
  })

  it("should default message to null", () => {
    const conn = Connection.create({
      requesterId: "a",
      receiverId: "b",
    })
    expect(conn.message).toBeNull()
  })

  it("should throw when creating self-connection", () => {
    expect(() =>
      Connection.create({ requesterId: "same", receiverId: "same" })
    ).toThrow("Cannot create a connection with yourself")
  })

  it("should accept a pending connection", () => {
    const conn = Connection.create({
      requesterId: "a",
      receiverId: "b",
    })
    conn.accept()
    expect(conn.status).toBe("accepted")
    expect(conn.isAccepted).toBe(true)
    expect(conn.respondedAt).toBeInstanceOf(Date)
  })

  it("should reject a pending connection", () => {
    const conn = Connection.create({
      requesterId: "a",
      receiverId: "b",
    })
    conn.reject()
    expect(conn.status).toBe("rejected")
    expect(conn.isRejected).toBe(true)
    expect(conn.respondedAt).toBeInstanceOf(Date)
  })

  it("should throw when accepting non-pending connection", () => {
    const conn = Connection.create({
      requesterId: "a",
      receiverId: "b",
    })
    conn.accept()
    expect(() => conn.accept()).toThrow(
      "Only pending connections can be accepted"
    )
  })

  it("should throw when rejecting non-pending connection", () => {
    const conn = Connection.create({
      requesterId: "a",
      receiverId: "b",
    })
    conn.reject()
    expect(() => conn.reject()).toThrow(
      "Only pending connections can be rejected"
    )
  })

  it("should return defensive copies of dates", () => {
    const conn = Connection.create({
      requesterId: "a",
      receiverId: "b",
    })
    const created1 = conn.createdAt
    const created2 = conn.createdAt
    expect(created1.getTime()).toBe(created2.getTime())
    expect(created1).not.toBe(created2)
  })

  it("should reconstitute from props", () => {
    const conn = Connection.reconstitute({
      id: ConnectionId.create("conn-id"),
      requesterId: "a",
      receiverId: "b",
      message: "hi",
      status: "accepted",
      respondedAt: new Date(),
      createdAt: new Date(),
    })
    expect(conn.id.getValue()).toBe("conn-id")
    expect(conn.isAccepted).toBe(true)
  })

  it("should serialize to primitives", () => {
    const conn = Connection.create({
      requesterId: "a",
      receiverId: "b",
      message: "msg",
    })
    const p = conn.toPrimitives()
    expect(p.requesterId).toBe("a")
    expect(p.receiverId).toBe("b")
    expect(p.message).toBe("msg")
    expect(p.status).toBe("pending")
    expect(p.id).toBeDefined()
  })
})
