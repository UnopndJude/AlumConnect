import {
  QuizQuestionId,
  QuestionType,
  QuestionTypeValue,
  Difficulty,
  DifficultyValue,
} from "../value-objects"

export interface QuizQuestionProps {
  id: QuizQuestionId
  type: QuestionType
  question: string
  options: string[]
  correctIndex: number
  difficulty: Difficulty
  applicableClasses?: { from: number; to: number }
}

export class QuizQuestion {
  private constructor(private props: QuizQuestionProps) {}

  static create(
    props: Omit<QuizQuestionProps, "id"> & { id?: QuizQuestionId }
  ): QuizQuestion {
    return new QuizQuestion({
      ...props,
      id: props.id || QuizQuestionId.create(),
    })
  }

  static reconstitute(props: QuizQuestionProps): QuizQuestion {
    return new QuizQuestion(props)
  }

  get id(): QuizQuestionId {
    return this.props.id
  }

  get type(): QuestionType {
    return this.props.type
  }

  get question(): string {
    return this.props.question
  }

  get options(): string[] {
    return [...this.props.options]
  }

  get correctIndex(): number {
    return this.props.correctIndex
  }

  get difficulty(): Difficulty {
    return this.props.difficulty
  }

  get applicableClasses(): { from: number; to: number } | undefined {
    return this.props.applicableClasses
  }

  isCorrect(answerIndex: number): boolean {
    return answerIndex === this.props.correctIndex
  }

  update(updates: Partial<Omit<QuizQuestionProps, "id">>): void {
    if (updates.type) this.props.type = updates.type
    if (updates.question) this.props.question = updates.question
    if (updates.options) this.props.options = updates.options
    if (updates.correctIndex !== undefined)
      this.props.correctIndex = updates.correctIndex
    if (updates.difficulty) this.props.difficulty = updates.difficulty
    if (updates.applicableClasses !== undefined)
      this.props.applicableClasses = updates.applicableClasses
  }

  toPrimitives(): {
    id: string
    type: QuestionTypeValue
    question: string
    options: string[]
    correctIndex: number
    difficulty: DifficultyValue
    applicableClasses?: { from: number; to: number }
  } {
    return {
      id: this.props.id.getValue(),
      type: this.props.type.getValue(),
      question: this.props.question,
      options: [...this.props.options],
      correctIndex: this.props.correctIndex,
      difficulty: this.props.difficulty.getValue(),
      applicableClasses: this.props.applicableClasses,
    }
  }

  toPublicPrimitives(): {
    id: string
    type: QuestionTypeValue
    question: string
    options: string[]
    difficulty: DifficultyValue
  } {
    return {
      id: this.props.id.getValue(),
      type: this.props.type.getValue(),
      question: this.props.question,
      options: [...this.props.options],
      difficulty: this.props.difficulty.getValue(),
    }
  }
}
