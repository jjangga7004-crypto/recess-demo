import type { CategoryId, LinkItem, SourceId } from '../types';

// 운영자가 직접 골라 등록한 실제 공개 글(2026-10-21 확인).
// 로그인 없이 열리는지, 학생에게 보여줘도 괜찮은 내용인지 브라우저로 하나씩 열어 확인했다.
// 원문 본문·이미지·댓글·작성자 정보는 저장하지 않고, 주소와 직접 쓴 제목·소개만 둔다.
// 원문 댓글 수는 시간이 지나면 달라지므로 넣지 않는다.
interface Curated {
  id: string;
  source: SourceId;
  sourceName?: string;
  topic: CategoryId;
  url: string;
  title: string;
  summary: string;
  /** 원문에 표시된 게시 시각(KST). 없으면 비운다. */
  posted?: string;
}

export const CURATED: Curated[] = [
  {
    id: 'real-orbi-1',
    source: 'orbi',
    topic: 'study',
    url: 'https://orbi.kr/00079771148',
    title: '수능 직전 비문학, 정의 문장 읽는 습관 고치기',
    summary: '지문 속 용어 정의를 한 번 읽고 넘기지 말고 뒤까지 끌고 가며 읽자는 국어 칼럼이에요. 필자 책 소개가 함께 있어요.',
    posted: '2026-10-14T08:07:07+09:00',
  },
  {
    id: 'real-orbi-2',
    source: 'orbi',
    topic: 'study',
    url: 'https://orbi.kr/00079845116',
    title: '확률과 통계를 처음 하면 3점 문제까지 며칠 걸릴까',
    summary: '확통을 처음 시작하는 학생의 짧은 질문에 댓글로 경험이 오가는 글이에요.',
    posted: '2026-10-21T11:43:43+09:00',
  },
  {
    id: 'real-orbi-3',
    source: 'orbi',
    topic: 'daily',
    url: 'https://orbi.kr/00079709027',
    title: "'공부 잘하는 약'은 없다, ADHD 치료제 오남용 주의",
    summary: '오르비 운영진이 처방약을 임의로 먹으면 안 되는 이유를 정리한 안내글이에요.',
    posted: '2026-10-07T14:25:36+09:00',
  },
  {
    id: 'real-orbi-4',
    source: 'orbi',
    topic: 'daily',
    url: 'https://orbi.kr/00079285581',
    title: '지금 안 되는 것과 앞으로도 안 될 것은 다르다',
    summary: '성적이 안 올라 지친 학생에게 영어 강사가 쓴 응원 칼럼이에요.',
    posted: '2026-08-23T23:29:12+09:00',
  },
  {
    id: 'real-orbi-5',
    source: 'orbi',
    topic: 'daily',
    url: 'https://orbi.kr/00079842154',
    title: '쉬는 시간에 들을 노래 추천받는 글',
    summary: '노래를 추천하면 작성자가 별점을 매겨 주는 가벼운 잡담 글이에요.',
    posted: '2026-10-20T23:11:31+09:00',
  },
  {
    id: 'real-orbi-6',
    source: 'orbi',
    topic: 'admission',
    url: 'https://orbi.kr/00079844608',
    title: 'N수 끝에 의사가 된 선배가 돌아본 수험생활',
    summary: '현역과 N수, 수능 이후의 선택지에 대해 느낀 점을 적고 질문을 받는 글이에요.',
    posted: '2026-10-21T09:42:27+09:00',
  },
  {
    id: 'real-orbi-7',
    source: 'orbi',
    topic: 'admission',
    url: 'https://orbi.kr/00079838884',
    title: '군대에서 수능 준비하고 전역한 5수생 이야기',
    summary: '군 복무와 수험을 함께 해 온 과정을 담담하게 기록한 후기예요.',
    posted: '2026-10-20T20:01:28+09:00',
  },
  {
    id: 'real-dc-1',
    source: 'dc',
    topic: 'study',
    url: 'https://gall.dcinside.com/mgallery/board/view/?id=kicedblab&no=346',
    title: '한 문제를 여섯 가지로 풀어 보는 수학 기출 분석',
    summary: '2015학년도 9월 모의평가 수학 B형 30번의 여러 풀이를 비교한 글이에요.',
    posted: '2026-08-30T13:37:10+09:00',
  },
  {
    id: 'real-dc-2',
    source: 'dc',
    topic: 'study',
    url: 'https://gall.dcinside.com/mgallery/board/view/?id=kicedblab&no=182',
    title: '같은 발상이 이어지는 수학 기출 두 문항',
    summary: '2024·2026학년도 6월 모의평가 문항을 나란히 놓고 발상을 짚은 글이에요.',
    posted: '2026-05-15T21:10:17+09:00',
  },
  {
    id: 'real-dc-3',
    source: 'dc',
    topic: 'study',
    url: 'https://gall.dcinside.com/mgallery/board/view/?id=ethicsideology&no=16265',
    title: '생활과 윤리·윤리와 사상 무료 개념 위키 소식',
    summary: '수특·수완까지 반영한 무료 개념 위키를 소개하는 글이에요. 외부 사이트로 연결돼요.',
    posted: '2026-08-20T18:04:27+09:00',
  },
  {
    id: 'real-etc-1',
    source: 'etc',
    sourceName: '한국교육과정평가원',
    topic: 'admission',
    url: 'https://www.suneung.re.kr/boardCnts/view.do?boardID=1500229&boardSeq=5096829&lev=0&m=0301&s=suneung',
    title: '2027 수능 수험생 유의사항 공식 자료',
    summary: '시험 당일 유의사항, 답안지 작성, 부정행위 안내를 정리한 평가원 공지예요.',
    // 원문에는 등록일만 있다.
    posted: '2026-10-15T12:00:00+09:00',
  },
  {
    id: 'real-etc-2',
    source: 'etc',
    sourceName: '대입정보포털 어디가',
    topic: 'admission',
    url: 'https://www.adiga.kr/',
    title: '대학·학과·전형 정보를 찾아보는 대입정보포털',
    summary: '대학과 학과, 전형을 검색하고 성적을 넣어 분석해 볼 수 있어요.',
  },
];

/** 실제 링크 카드. 예시 카드보다 위에 오도록 등록 시각을 지금 직전으로 둔다. */
export function createCuratedLinks(now: number): LinkItem[] {
  return CURATED.map((c, i) => ({
    id: c.id,
    kind: 'manual',
    source: c.source,
    sourceName: c.sourceName,
    url: c.url,
    title: c.title,
    summary: c.summary,
    topic: c.topic,
    postedAt: c.posted ? new Date(c.posted).getTime() : undefined,
    addedAt: now - (i + 1) * 60_000,
    status: 'published',
  }));
}
