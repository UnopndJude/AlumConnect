import { Connection } from "@/domain/connection/entities/Connection"
import { IConnectionRepository } from "@/domain/connection/repositories/IConnectionRepository"

const connections: Map<string, Connection> = new Map()

export class InMemoryConnectionRepository implements IConnectionRepository {
  async save(connection: Connection): Promise<void> {
    connections.set(connection.id.getValue(), connection)
  }

  async findById(id: string): Promise<Connection | null> {
    return connections.get(id) || null
  }

  async findByRequesterId(requesterId: string): Promise<Connection[]> {
    return Array.from(connections.values()).filter(
      (connection) => connection.requesterId === requesterId
    )
  }

  async findByReceiverId(receiverId: string): Promise<Connection[]> {
    return Array.from(connections.values()).filter(
      (connection) => connection.receiverId === receiverId
    )
  }

  async findPendingForUser(userId: string): Promise<Connection[]> {
    return Array.from(connections.values()).filter(
      (connection) =>
        connection.receiverId === userId && connection.status === "pending"
    )
  }

  async findAcceptedConnections(userId: string): Promise<Connection[]> {
    return Array.from(connections.values()).filter(
      (connection) =>
        (connection.requesterId === userId ||
          connection.receiverId === userId) &&
        connection.status === "accepted"
    )
  }

  async findBetweenUsers(
    userId1: string,
    userId2: string
  ): Promise<Connection | null> {
    for (const connection of connections.values()) {
      if (
        (connection.requesterId === userId1 &&
          connection.receiverId === userId2) ||
        (connection.requesterId === userId2 &&
          connection.receiverId === userId1)
      ) {
        return connection
      }
    }
    return null
  }

  async delete(id: string): Promise<void> {
    connections.delete(id)
  }
}
