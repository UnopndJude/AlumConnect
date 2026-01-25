import { AlumniId, MatchConfidence } from "../value-objects"

export class AlumniMatchResult {
  private constructor(
    public readonly matched: boolean,
    public readonly alumniId: AlumniId | null,
    public readonly confidence: MatchConfidence,
    public readonly message: string
  ) {}

  static exactMatch(alumniId: AlumniId): AlumniMatchResult {
    return new AlumniMatchResult(
      true,
      alumniId,
      MatchConfidence.exact(),
      "동문 DB에서 확인되었습니다."
    )
  }

  static partialMatch(message: string): AlumniMatchResult {
    return new AlumniMatchResult(
      false,
      null,
      MatchConfidence.partial(),
      message
    )
  }

  static noMatch(): AlumniMatchResult {
    return new AlumniMatchResult(
      false,
      null,
      MatchConfidence.none(),
      "동문 DB에서 찾을 수 없습니다. 퀴즈 통과 시 관리자 검토가 필요합니다."
    )
  }

  toPrimitives() {
    return {
      matched: this.matched,
      alumniId: this.alumniId?.getValue(),
      confidence: this.confidence.getValue(),
      message: this.message,
    }
  }
}
