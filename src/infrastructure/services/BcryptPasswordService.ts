import bcrypt from "bcrypt"
import { PasswordHasher } from "@/domain/user/value-objects/Password"

const SALT_ROUNDS = 10

export class BcryptPasswordService implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS)
  }

  async verify(plain: string, hashed: string): Promise<boolean> {
    if (!hashed.startsWith("$2")) {
      return plain === hashed
    }
    return bcrypt.compare(plain, hashed)
  }
}
