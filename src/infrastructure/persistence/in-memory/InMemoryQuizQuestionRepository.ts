import { QuizQuestion } from "@/domain/quiz/entities/QuizQuestion"
import { IQuizQuestionRepository } from "@/domain/quiz/repositories/IQuizQuestionRepository"
import {
  QuizQuestionId,
  QuestionType,
  Difficulty,
} from "@/domain/quiz/value-objects"

const questions: Map<string, QuizQuestion> = new Map()

const seedData = [
  {
    id: "q1",
    type: "basic" as const,
    question: "인천과학고등학교가 위치한 지역은?",
    options: ["연수구", "남동구", "부평구", "중구"],
    correctIndex: 0,
    difficulty: "easy" as const,
  },
  {
    id: "q2",
    type: "basic" as const,
    question: "인천과학고등학교는 몇 년에 개교했나요?",
    options: ["1992년", "1994년", "1996년", "1998년"],
    correctIndex: 1,
    difficulty: "medium" as const,
  },
  {
    id: "q3",
    type: "basic" as const,
    question: "인천과학고등학교의 학생 정원은 학년당 약 몇 명인가요?",
    options: ["60명", "90명", "120명", "150명"],
    correctIndex: 1,
    difficulty: "easy" as const,
  },
  {
    id: "q4",
    type: "basic" as const,
    question: "인천과학고등학교의 수업 연한은?",
    options: ["2년", "3년", "4년", "6년"],
    correctIndex: 1,
    difficulty: "easy" as const,
  },
  {
    id: "q5",
    type: "facility" as const,
    question: "학교 내 주요 과학 실험실이 아닌 것은?",
    options: ["물리실험실", "화학실험실", "생물실험실", "요리실습실"],
    correctIndex: 3,
    difficulty: "easy" as const,
  },
  {
    id: "q6",
    type: "facility" as const,
    question: "학교 기숙사의 이름은?",
    options: ["송도학사", "과학학사", "인천학사", "송학사"],
    correctIndex: 0,
    difficulty: "medium" as const,
  },
  {
    id: "q7",
    type: "facility" as const,
    question: "학교 도서관이 위치한 건물은?",
    options: ["본관", "과학관", "체육관", "기숙사"],
    correctIndex: 0,
    difficulty: "medium" as const,
  },
  {
    id: "q8",
    type: "facility" as const,
    question: "교내 컴퓨터실에서 주로 사용하는 프로그래밍 언어 수업은?",
    options: ["Java", "Python", "C/C++", "모두 해당"],
    correctIndex: 3,
    difficulty: "easy" as const,
  },
  {
    id: "q9",
    type: "culture" as const,
    question: "인천과학고의 대표적인 학교 행사가 아닌 것은?",
    options: ["과학제", "체육대회", "축제", "수학경시대회"],
    correctIndex: 3,
    difficulty: "easy" as const,
  },
  {
    id: "q10",
    type: "culture" as const,
    question: "학교 교훈에 포함되는 가치는?",
    options: ["창의", "성실", "봉사", "모두 해당"],
    correctIndex: 3,
    difficulty: "medium" as const,
  },
  {
    id: "q11",
    type: "culture" as const,
    question:
      "인천과학고 학생들이 참가하는 대표적인 과학 올림피아드가 아닌 것은?",
    options: [
      "물리올림피아드",
      "화학올림피아드",
      "정보올림피아드",
      "미술올림피아드",
    ],
    correctIndex: 3,
    difficulty: "easy" as const,
  },
  {
    id: "q12",
    type: "culture" as const,
    question: "학교에서 진행하는 R&E 프로그램은 무엇의 약자인가요?",
    options: [
      "Research & Education",
      "Reading & English",
      "Rest & Exercise",
      "Review & Exam",
    ],
    correctIndex: 0,
    difficulty: "medium" as const,
  },
  {
    id: "q13",
    type: "class_specific" as const,
    question: "인천과학고 졸업생이 가장 많이 진학하는 대학교는?",
    options: ["KAIST", "서울대학교", "포항공대", "연세대학교"],
    correctIndex: 0,
    difficulty: "medium" as const,
  },
  {
    id: "q14",
    type: "class_specific" as const,
    question: "과학고 학생들이 주로 준비하는 입시 전형은?",
    options: ["정시", "수시", "특기자전형", "학생부종합전형"],
    correctIndex: 3,
    difficulty: "medium" as const,
  },
  {
    id: "q15",
    type: "culture" as const,
    question: "인천과학고등학교의 교복 상의 색상은?",
    options: ["네이비", "검정", "회색", "흰색"],
    correctIndex: 0,
    difficulty: "easy" as const,
  },
  {
    id: "q16",
    type: "facility" as const,
    question: "학교 운동장에서 할 수 없는 운동은?",
    options: ["축구", "농구", "야구", "테니스"],
    correctIndex: 2,
    difficulty: "easy" as const,
  },
  {
    id: "q17",
    type: "culture" as const,
    question: "인천과학고의 급식은 어디서 제공되나요?",
    options: ["학교 식당", "기숙사 식당", "외부 배달", "학교와 기숙사 모두"],
    correctIndex: 3,
    difficulty: "easy" as const,
  },
  {
    id: "q18",
    type: "basic" as const,
    question: "인천과학고등학교는 어떤 유형의 학교인가요?",
    options: ["일반고", "특성화고", "과학영재학교", "과학고등학교"],
    correctIndex: 3,
    difficulty: "easy" as const,
  },
  {
    id: "q19",
    type: "culture" as const,
    question: "학교에서 진행하는 사사 프로그램의 목적은?",
    options: ["어학 연수", "연구 지도", "체육 훈련", "예술 교육"],
    correctIndex: 1,
    difficulty: "medium" as const,
  },
  {
    id: "q20",
    type: "basic" as const,
    question: "인천과학고등학교의 설립 주체는?",
    options: ["교육부", "인천광역시교육청", "과학기술정보통신부", "사립재단"],
    correctIndex: 1,
    difficulty: "medium" as const,
  },
]

seedData.forEach((data) => {
  const question = QuizQuestion.create({
    id: QuizQuestionId.create(data.id),
    type: QuestionType.fromString(data.type),
    question: data.question,
    options: data.options,
    correctIndex: data.correctIndex,
    difficulty: Difficulty.fromString(data.difficulty),
  })
  questions.set(data.id, question)
})

export class InMemoryQuizQuestionRepository implements IQuizQuestionRepository {
  async findById(id: QuizQuestionId): Promise<QuizQuestion | null> {
    return questions.get(id.getValue()) || null
  }

  async findByIdString(id: string): Promise<QuizQuestion | null> {
    return questions.get(id) || null
  }

  async findAll(): Promise<QuizQuestion[]> {
    return Array.from(questions.values())
  }

  async findByType(type: QuestionType): Promise<QuizQuestion[]> {
    return Array.from(questions.values()).filter(
      (q) => q.type.getValue() === type.getValue()
    )
  }

  async findByDifficulty(difficulty: Difficulty): Promise<QuizQuestion[]> {
    return Array.from(questions.values()).filter(
      (q) => q.difficulty.getValue() === difficulty.getValue()
    )
  }

  async findRandom(count: number): Promise<QuizQuestion[]> {
    const all = Array.from(questions.values())
    const shuffled = all.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }

  async save(question: QuizQuestion): Promise<void> {
    questions.set(question.id.getValue(), question)
  }

  async delete(id: QuizQuestionId): Promise<boolean> {
    return questions.delete(id.getValue())
  }

  async count(): Promise<number> {
    return questions.size
  }
}
