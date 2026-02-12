import { Connection } from "../entities/Connection"

export interface IConnectionRepository {
  save(connection: Connection): Promise<void>
  findById(id: string): Promise<Connection | null>
  findByRequesterId(requesterId: string): Promise<Connection[]>
  findByReceiverId(receiverId: string): Promise<Connection[]>
  findPendingForUser(userId: string): Promise<Connection[]>
  findAcceptedConnections(userId: string): Promise<Connection[]>
  findBetweenUsers(userId1: string, userId2: string): Promise<Connection | null>
  delete(id: string): Promise<void>
}
