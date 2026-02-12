export class ConnectionId {
  private constructor(private readonly value: string) {}

  static create(id?: string): ConnectionId {
    const value = id || crypto.randomUUID()
    return new ConnectionId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: ConnectionId): boolean {
    return this.value === other.value
  }
}
