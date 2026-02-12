import { ConnectionId } from "../value-objects"

export type ConnectionStatus = "pending" | "accepted" | "rejected"

export interface ConnectionProps {
  id: ConnectionId
  requesterId: string
  receiverId: string
  message: string | null
  status: ConnectionStatus
  respondedAt: Date | null
  createdAt: Date
}

export interface CreateConnectionProps {
  requesterId: string
  receiverId: string
  message?: string | null
}

export class Connection {
  private constructor(private props: ConnectionProps) {}

  static create(props: CreateConnectionProps): Connection {
    return new Connection({
      id: ConnectionId.create(),
      requesterId: props.requesterId,
      receiverId: props.receiverId,
      message: props.message || null,
      status: "pending",
      respondedAt: null,
      createdAt: new Date(),
    })
  }

  static reconstitute(props: ConnectionProps): Connection {
    return new Connection(props)
  }

  // Getters
  get id(): ConnectionId {
    return this.props.id
  }

  get requesterId(): string {
    return this.props.requesterId
  }

  get receiverId(): string {
    return this.props.receiverId
  }

  get message(): string | null {
    return this.props.message
  }

  get status(): ConnectionStatus {
    return this.props.status
  }

  get respondedAt(): Date | null {
    return this.props.respondedAt
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get isPending(): boolean {
    return this.props.status === "pending"
  }

  get isAccepted(): boolean {
    return this.props.status === "accepted"
  }

  get isRejected(): boolean {
    return this.props.status === "rejected"
  }

  // Domain Methods
  accept(): void {
    this.props.status = "accepted"
    this.props.respondedAt = new Date()
  }

  reject(): void {
    this.props.status = "rejected"
    this.props.respondedAt = new Date()
  }

  // Serialization
  toPrimitives(): {
    id: string
    requesterId: string
    receiverId: string
    message: string | null
    status: ConnectionStatus
    respondedAt: Date | null
    createdAt: Date
  } {
    return {
      id: this.props.id.getValue(),
      requesterId: this.props.requesterId,
      receiverId: this.props.receiverId,
      message: this.props.message,
      status: this.props.status,
      respondedAt: this.props.respondedAt,
      createdAt: this.props.createdAt,
    }
  }
}
