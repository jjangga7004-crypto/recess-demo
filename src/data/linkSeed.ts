import type { CategoryId, LinkItem, SourceId } from '../types';

// 모아보기 예시 카드. 모두 가상의 소개글이며 실제 커뮤니티 글이 아니다.
// 원문 주소가 없으므로 버튼은 앱 안의 예시 상세 화면으로 연결된다.
// excerpt는 '출처 허락을 받으면 본문 일부가 이렇게 보인다'를 보여주는 가상 문장이다.
interface SeedLink {
  source: SourceId;
  sourceName?: string;
  topic: CategoryId;
  title: string;
  summary: string;
  excerpt: string;
  body: string;
  addedMin: number;
  postedMin?: number;
  replies?: number;
}

const SEED: SeedLink[] = [
  {
    source: 'orbi', topic: 'study', addedMin: 18, postedMin: 300, replies: 31,
    title: '탐구 기출, 개념 끝내고 풀까 먼저 풀고 개념 채울까',
    summary: '기출을 먼저 풀고 모르는 개념을 거꾸로 채우는 방식을 두고 의견이 갈린 글이에요.',
    excerpt: '개념 다 끝내고 기출 들어가려니까 시간이 너무 부족해서요. 기출 먼저 풀면서 모르는 개념을 채우는 방식, 해 보신 분 계세요?',
    body: '개념 → 기출 순서가 정석이라는 의견과, 기출을 먼저 풀어야 어떤 개념이 중요한지 보인다는 의견이 오가는 글을 떠올리며 만든 예시예요.',
  },
  {
    source: 'suman', topic: 'study', addedMin: 40, replies: 12,
    title: '영어 듣기 하루 15분, 석 달 이어간 후기 모음',
    summary: '짧게라도 매일 듣기를 이어간 학생들의 경험담을 모아 둔 글이에요.',
    excerpt: '처음엔 받아쓰기까지 하다가 지쳐서 그냥 등굣길에 듣기만 했는데, 석 달 지나니까 귀가 확실히 편해졌어요.',
    body: '출퇴근길처럼 등하굣길에 듣기를 붙여 둔 방법, 받아쓰기를 섞은 방법 등 습관을 만든 이야기를 모은 글을 가정한 예시예요.',
  },
  {
    source: 'dc', topic: 'daily', addedMin: 55, postedMin: 120, replies: 48,
    title: '시험 끝난 날 가기 좋은 곳 추천해 주는 글',
    summary: '보드게임카페, 한강 자전거처럼 시험 끝나고 가 본 곳을 서로 추천하는 글이에요.',
    excerpt: '노래방이랑 마라탕은 이제 질렸다… 시험 끝나고 갔던 곳 중에 괜찮았던 데 있으면 추천 좀.',
    body: '노래방·마라탕 말고 새로운 코스를 찾는 학생들이 서로 장소를 추천하는 흐름의 글을 가정한 예시예요.',
  },
  {
    source: 'suman', topic: 'admission', addedMin: 75, replies: 20,
    title: '고2 겨울방학 계획 세울 때 체크할 것들',
    summary: '과목별 목표, 생활 리듬, 쉬는 날까지 겨울방학 계획표에 넣을 항목을 정리한 글이에요.',
    excerpt: '방학 계획을 과목 분량으로만 짰다가 2주 만에 무너졌던 적이 있어서, 이번엔 기상 시간부터 정해 보려고 해요.',
    body: '방학 계획을 세울 때 과목별 분량만 적지 말고 기상 시간, 운동, 쉬는 날을 함께 정하자는 내용의 글을 가정한 예시예요.',
  },
  {
    source: 'orbi', topic: 'school', addedMin: 95, postedMin: 1500, replies: 9,
    title: '동아리 활동이랑 공부 같이 해 본 사람들 이야기',
    summary: '시험 기간에 동아리 일정을 어떻게 조절했는지 경험을 나누는 글이에요.',
    excerpt: '시험 2주 전에는 동아리 회의를 온라인으로 돌렸어요. 부원들한테 미리 말해 두니까 생각보다 다들 이해해 줬고요.',
    body: '부장을 맡았던 학생, 동아리를 줄였던 학생 등 각자 시간을 나눈 방법을 이야기하는 글을 가정한 예시예요.',
  },
  {
    source: 'etc', sourceName: '개인 블로그', topic: 'study', addedMin: 130,
    title: '플래너 쓰는 법 비교: 시간 단위 vs 할 일 단위',
    summary: '두 가지 플래너 작성법을 직접 써 보고 장단점을 비교한 글이에요.',
    excerpt: '30분 단위로 쪼개 쓰니까 계획 세우는 데만 20분이 걸리더라고요. 그래서 2주씩 두 방식을 비교해 봤어요.',
    body: '30분 단위로 시간을 쪼개 쓰는 방식과 그날 할 일만 적는 방식을 각각 2주씩 써 본 비교 글을 가정한 예시예요.',
  },
  {
    source: 'dc', topic: 'school', addedMin: 160, replies: 37,
    title: '축제 부스 아이디어, 반응 좋았던 것들',
    summary: '방탈출, 타로, 추억의 문방구까지 학교 축제에서 줄이 길었던 부스 이야기예요.',
    excerpt: '작년에 추억의 문방구 콘셉트로 했는데 줄이 복도 끝까지 섰어요. 준비물은 생각보다 간단했고요.',
    body: '축제를 준비하는 학생이 아이디어를 묻고 다른 학교 학생들이 경험을 답하는 글을 가정한 예시예요.',
  },
  {
    source: 'orbi', topic: 'admission', addedMin: 190, postedMin: 2900, replies: 26,
    title: '모의고사 성적표, 표준점수와 백분위는 뭐가 다를까',
    summary: '성적표에 나오는 항목이 각각 무엇을 뜻하는지 정리한 글이에요.',
    excerpt: '처음 성적표를 받았을 때 표준점수랑 백분위가 왜 다른지 몰라서 한참 찾아봤던 걸 정리해 봤어요.',
    body: '원점수, 표준점수, 백분위, 등급이 각각 무엇을 보여주는지 처음 성적표를 받은 학생 눈높이로 정리한 글을 가정한 예시예요.',
  },
  {
    source: 'suman', topic: 'daily', addedMin: 230, replies: 54,
    title: '잠 줄이기 vs 잠 지키기, 수험생 수면 이야기',
    summary: '잠을 줄였다가 다시 늘린 경험, 낮잠 활용법 등 수면 습관을 나누는 글이에요.',
    excerpt: '잠을 5시간으로 줄였던 한 달 동안 오히려 오후 집중이 무너졌어요. 지금은 6시간 반은 꼭 지키는 중이에요.',
    body: '수면 시간을 줄였을 때와 지켰을 때 공부 집중도가 어땠는지 서로의 경험을 이야기하는 글을 가정한 예시예요.',
  },
  {
    source: 'dc', topic: 'study', addedMin: 270, postedMin: 400, replies: 63,
    title: '수학 4점 문제, 막히면 몇 분까지 붙잡아야 할까',
    summary: '한 문제에 쓰는 시간 기준을 두고 의견이 갈린 글이에요.',
    excerpt: '한 문제에 15분 넘게 붙잡다가 시험 운영이 다 꼬였던 적이 있어서, 나만의 기준을 정하고 싶어요.',
    body: '"10분 넘으면 넘긴다"와 "끝까지 붙잡아야 실력이 는다"는 의견이 오가는 글을 가정한 예시예요.',
  },
  {
    source: 'suman', topic: 'school', addedMin: 320, replies: 15,
    title: '수행평가 발표 떨릴 때 쓰는 방법 모음',
    summary: '대본 카드, 리허설 녹음 등 발표 긴장을 줄인 방법을 모은 글이에요.',
    excerpt: '첫 문장만 완벽하게 외워 두면 그다음은 생각보다 자연스럽게 나오더라고요.',
    body: '발표 전날 친구 앞에서 연습하기, 첫 문장만 외워 두기처럼 학생들이 써 본 방법을 모은 글을 가정한 예시예요.',
  },
  {
    source: 'orbi', topic: 'daily', addedMin: 380, replies: 8,
    title: '공부하다 지칠 때 하는 10분 리프레시',
    summary: '스트레칭, 산책, 음악 한 곡처럼 짧게 쉬는 방법을 공유하는 글이에요.',
    excerpt: '쉬는 시간에 휴대폰을 보면 10분이 30분이 돼서, 요즘은 복도 한 바퀴 걷고 물 마시는 걸로 바꿨어요.',
    body: '쉬는 시간이 길어지지 않으면서 머리를 식히는 방법을 서로 추천하는 글을 가정한 예시예요.',
  },
  {
    source: 'dc', topic: 'admission', addedMin: 440, postedMin: 4300, replies: 41,
    title: '원서 쓰기 전에 선배들이 아쉬워했던 점',
    summary: '지원 전략보다 일정 관리와 서류 확인에서 놓쳤던 점을 이야기하는 글이에요.',
    excerpt: '마감을 날짜로만 기억하고 있다가 마감 시각을 당일에야 확인했어요. 다들 시각까지 꼭 확인하세요.',
    body: '마감 시각을 착각했던 일, 제출 서류를 늦게 챙긴 일처럼 선배들이 아쉬워한 경험을 모은 글을 가정한 예시예요.',
  },
  {
    source: 'etc', sourceName: '학생 뉴스레터', topic: 'school', addedMin: 520,
    title: '교복 vs 생활복, 학교마다 다른 규칙 이야기',
    summary: '생활복 허용 범위, 체육복 등교 등 학교별 복장 규칙을 비교한 글이에요.',
    excerpt: '우리 학교는 생활복이 허용되는데 친구 학교는 체육복 등교도 안 된대서 놀랐어요.',
    body: '여러 학교 학생들이 자기 학교의 복장 규칙을 소개하고 장단점을 이야기하는 글을 가정한 예시예요.',
  },
  {
    source: 'orbi', topic: 'study', addedMin: 600, postedMin: 900, replies: 19,
    title: '국어 문학 선지 판단, 근거 표시하는 연습법',
    summary: '선지마다 지문 속 근거를 표시하며 푸는 연습 방법을 소개하는 글이에요.',
    excerpt: '선지 옆에 근거 줄 번호를 적는 연습을 2주 했더니 감으로 고르는 버릇이 조금씩 줄었어요.',
    body: '감으로 고르던 습관을 바꾸려고 선지 옆에 근거 줄 번호를 적는 연습을 했다는 내용의 글을 가정한 예시예요.',
  },
  {
    source: 'suman', topic: 'admission', addedMin: 700, replies: 22,
    title: '진로 희망이 바뀌면 생기부는 어떻게 이어갈까',
    summary: '중간에 진로가 바뀐 학생들이 활동을 어떻게 연결했는지 나누는 글이에요.',
    excerpt: '고1 때는 공학 쪽이었다가 고2에 교육 쪽으로 바뀌었는데, 활동을 어떻게 이어 갈지 아직 고민 중이에요.',
    body: '진로가 바뀐 이유와 그 과정에서 한 활동을 솔직하게 정리했다는 경험담을 나누는 글을 가정한 예시예요. 학교마다 운영이 다를 수 있어요.',
  },
  {
    source: 'dc', topic: 'school', addedMin: 820, replies: 29,
    title: '급식 메뉴 투표하는 학교 있어?',
    summary: '학생 의견으로 급식 메뉴를 정하는 학교들의 이야기를 모은 글이에요.',
    excerpt: '우리 학교는 학생회가 한 달에 한 번 특식 메뉴를 투표로 정해요. 다른 학교도 이런 거 하나요?',
    body: '학생회가 메뉴 설문을 하는 학교, 특식 날을 정하는 학교 등 서로의 학교 이야기를 나누는 글을 가정한 예시예요.',
  },
  {
    source: 'orbi', topic: 'daily', addedMin: 950, replies: 14,
    title: '공부 브이로그 보면서 동기부여 받는 사람?',
    summary: '공부 영상을 동기부여로 쓰는 방법과 시간 관리 사이의 고민을 나누는 글이에요.',
    excerpt: '브이로그를 틀어 놓고 같이 공부하면 집중이 되는데, 가끔 영상만 보고 있는 저를 발견해요.',
    body: '영상을 틀어 두면 집중이 되는지, 오히려 시간을 뺏기는지 경험을 나누는 글을 가정한 예시예요.',
  },
  {
    source: 'suman', topic: 'daily', addedMin: 1100, replies: 33,
    title: '고등학생 용돈 관리 어떻게 해?',
    summary: '용돈 기입장, 체크카드 알림 등 용돈을 관리하는 방법을 나누는 글이에요.',
    excerpt: '매점이랑 편의점에서 쓰는 돈이 한 달에 생각보다 많더라고요. 체크카드 알림을 켜고 나서 좀 줄었어요.',
    body: '매점·간식비가 생각보다 많이 나간다는 고민에서 시작해 각자 관리하는 방법을 이야기하는 글을 가정한 예시예요.',
  },
  {
    source: 'etc', sourceName: '개인 블로그', topic: 'admission', addedMin: 1300,
    title: '대학 캠퍼스 투어 다녀온 후기 정리',
    summary: '방학에 캠퍼스 투어를 다녀와서 좋았던 점과 아쉬웠던 점을 정리한 글이에요.',
    excerpt: '학과 설명보다 캠퍼스 분위기를 직접 보는 게 동기부여가 됐어요. 사진 찍을 곳도 많고요.',
    body: '학과 설명보다 캠퍼스 분위기를 보는 데 의미가 있었다는 후기 글을 가정한 예시예요.',
  },
  // ---- 10월 모의고사 주제 (4판에 추가). 실제 시험의 난도·문항에 대한 사실을 단정하지 않는다. ----
  {
    source: 'orbi', topic: 'study', addedMin: 12, postedMin: 200, replies: 27,
    title: '10월 모의고사 국어, 시간 배분 어떻게 했는지 모아 보기',
    summary: '10모를 본 학생들이 독서·문학 푸는 순서와 시간 배분을 서로 비교하는 글이에요.',
    excerpt: '독서 첫 지문에서 10분 넘게 써 버려서 뒤가 다 밀렸어요. 다음엔 문학을 먼저 풀어 볼까 고민 중인데…',
    body: '모의고사를 본 뒤 푸는 순서와 지문당 시간을 어떻게 나눴는지 경험을 비교하는 글을 가정한 예시예요.',
  },
  {
    source: 'dc', topic: 'study', addedMin: 26, postedMin: 260, replies: 18,
    title: '10모 수학, 마지막 문항 어떻게 시작했는지 비교',
    summary: '같은 문항을 서로 다른 방식으로 시작한 풀이를 나란히 놓고 이야기하는 글이에요.',
    excerpt: '그래프를 먼저 그려 보니까 조건이 정리되던데, 다른 사람들은 어떤 식으로 시작했는지 궁금해서 써 봐요.',
    body: '한 문항을 두고 각자 첫 발상을 공유하는 흐름의 글을 가정한 예시예요. 실제 문항 내용은 담지 않았어요.',
  },
  {
    source: 'suman', topic: 'admission', addedMin: 34, postedMin: 500, replies: 22,
    title: '10월 모의고사 성적으로 정시 방향 다시 생각해 본 이야기',
    summary: '6월·9월·10월 성적 흐름을 보고 지원 방향을 고민하는 글이에요.',
    excerpt: '6월, 9월, 10월 성적을 나란히 놓고 보니 과목별로 흐름이 달라서, 어디에 시간을 더 써야 할지 보이더라고요.',
    body: '여러 번의 모의고사 성적을 비교하며 남은 기간 계획을 다시 세우는 글을 가정한 예시예요.',
  },
  {
    source: 'orbi', topic: 'daily', addedMin: 48, postedMin: 700, replies: 35,
    title: '10모 끝난 날 다들 뭐 했어?',
    summary: '시험이 끝난 날 바로 복기했는지, 쉬었는지 서로 이야기하는 글이에요.',
    excerpt: '시험 끝나고 바로 복기하려다가 그냥 친구랑 떡볶이 먹으러 갔어요. 그래도 괜찮겠죠…?',
    body: '시험 직후 복기와 휴식 사이에서 각자 어떻게 보냈는지 나누는 가벼운 글을 가정한 예시예요.',
  },
];

export function createSeedLinks(now: number): LinkItem[] {
  return SEED.map((s, i) => ({
    id: `ex-${i + 1}`,
    kind: 'example',
    source: s.source,
    sourceName: s.sourceName,
    title: s.title,
    summary: s.summary,
    excerpt: s.excerpt,
    topic: s.topic,
    postedAt: s.postedMin ? now - s.postedMin * 60_000 : undefined,
    addedAt: now - s.addedMin * 60_000,
    originalReplies: s.replies,
    exampleBody: s.body,
    status: 'published',
  }));
}
