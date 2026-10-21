// 인기 주제 후보. 순위는 모아보기·RECESS 글과 이 기기의 검색을 기준으로 계산한다(lib/trending.ts).
// 한 주제에 여러 표기를 묶어 둔다(예: "10모" = "10월 모의고사").
export interface TrendKeyword {
  id: string;
  label: string;
  terms: string[];
}

export const TREND_KEYWORDS: TrendKeyword[] = [
  { id: 'oct-mock', label: '10월 모의고사', terms: ['10월 모의고사', '10모', '10월 학평', '10월 모평'] },
  { id: 'd30', label: '수능 D-30', terms: ['d-30', 'd-29', '수능 직전', '파이널'] },
  { id: 'reading', label: '비문학·독서', terms: ['비문학', '독서'] },
  { id: 'math', label: '수학', terms: ['수학', '확통', '확률과 통계', '4점', '미적'] },
  { id: 'kichul', label: '기출 분석', terms: ['기출'] },
  { id: 'nsu', label: 'N수·재수', terms: ['n수', '재수', '5수', '4수'] },
  { id: 'sleep', label: '수면·컨디션', terms: ['수면', '늦잠', '컨디션', '피곤', '잠을'] },
  { id: 'record', label: '생기부·세특', terms: ['생기부', '세특'] },
  { id: 'perf', label: '수행평가', terms: ['수행평가', '수행 '] },
  { id: 'wrong', label: '오답노트', terms: ['오답'] },
  { id: 'ethics', label: '생윤·윤사', terms: ['생윤', '윤사', '생활과 윤리', '윤리와 사상'] },
  { id: 'review', label: '모의고사 복기', terms: ['복기'] },
  { id: 'festival', label: '축제', terms: ['축제', '부스'] },
  { id: 'career', label: '진로·학과', terms: ['진로', '학과', '전공'] },
  { id: 'english', label: '영어', terms: ['영어', '영단어', '듣기'] },
  { id: 'planner', label: '플래너·계획', terms: ['플래너', '계획'] },
  { id: 'meal', label: '급식', terms: ['급식', '마라샹궈'] },
  { id: 'rest', label: '쉬는 시간', terms: ['노래', '브금', '리프레시', '쉬는 시간'] },
];

export const KEYWORD_BY_ID: Record<string, TrendKeyword> = Object.fromEntries(TREND_KEYWORDS.map((k) => [k.id, k]));

export function matchesKeyword(text: string, kw: TrendKeyword): boolean {
  const t = text.toLowerCase();
  return kw.terms.some((term) => t.includes(term));
}
