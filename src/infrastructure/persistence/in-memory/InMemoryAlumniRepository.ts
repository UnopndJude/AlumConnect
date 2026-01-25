import { Alumni } from "@/domain/alumni/entities/Alumni"
import { IAlumniRepository } from "@/domain/alumni/repositories/IAlumniRepository"
import { AlumniId } from "@/domain/alumni/value-objects"
import { GraduationClass } from "@/domain/user/value-objects"

const alumniDatabase: Map<string, Alumni> = new Map()

const seedData = [
  { id: "alumni-1", name: "김철수", graduationClass: 1 },
  { id: "alumni-2", name: "이영희", graduationClass: 2 },
  { id: "alumni-3", name: "박지훈", graduationClass: 3 },
  { id: "alumni-4", name: "최수진", graduationClass: 4 },
  { id: "alumni-5", name: "정민호", graduationClass: 5 },
  { id: "alumni-6", name: "강서연", graduationClass: 6 },
  { id: "alumni-7", name: "윤태영", graduationClass: 7 },
  { id: "alumni-8", name: "임지은", graduationClass: 8 },
  { id: "alumni-9", name: "한승우", graduationClass: 9 },
  { id: "alumni-10", name: "오현정", graduationClass: 10 },
  { id: "alumni-11", name: "신동현", graduationClass: 11 },
  { id: "alumni-12", name: "황미래", graduationClass: 12 },
  { id: "alumni-13", name: "조성민", graduationClass: 1 },
  { id: "alumni-14", name: "백서현", graduationClass: 2 },
  { id: "alumni-15", name: "류현우", graduationClass: 3 },
]

seedData.forEach((data) => {
  const gradClassResult = GraduationClass.create(data.graduationClass)
  if (gradClassResult.success) {
    const alumni = Alumni.reconstitute({
      id: AlumniId.create(data.id),
      name: data.name,
      graduationClass: gradClassResult.value,
      isRegistered: false,
    })
    alumniDatabase.set(data.id, alumni)
  }
})

export class InMemoryAlumniRepository implements IAlumniRepository {
  async findById(id: AlumniId): Promise<Alumni | null> {
    return alumniDatabase.get(id.getValue()) || null
  }

  async findByNameAndClass(
    name: string,
    graduationClass: GraduationClass
  ): Promise<Alumni | null> {
    for (const alumni of alumniDatabase.values()) {
      if (alumni.matchesNameAndClass(name, graduationClass)) {
        return alumni
      }
    }
    return null
  }

  async findByName(name: string): Promise<Alumni | null> {
    for (const alumni of alumniDatabase.values()) {
      if (alumni.matchesName(name)) {
        return alumni
      }
    }
    return null
  }

  async save(alumni: Alumni): Promise<void> {
    alumniDatabase.set(alumni.id.getValue(), alumni)
  }

  async findAll(): Promise<Alumni[]> {
    return Array.from(alumniDatabase.values())
  }
}
