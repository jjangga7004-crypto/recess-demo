import type { AppState, BadgeId, CategoryId, Comment, LinkPrefs, Post, User } from '../types';
import { createCuratedLinks } from './curatedLinks';
import { createSeedLinks } from './linkSeed';

// 예시 학생 계정. 학교·닉네임 모두 가상이며 실존 인물과 관계없다.
// 성적 뱃지 없이 활동하는 학생이 더 많도록 구성했다.
const SEED_USERS: User[] = [
  u('u1', '야자탈출', 'daechi-a'),
  u('u2', '오답노트장인', 'daechi-b', ['math1', 'share', 'steady'], ['math1', 'share']),
  u('u3', '급식러버', 'junggye-a'),
  u('u4', '새벽세시', 'daechi-c', ['steady'], ['steady']),
  u('u5', '모고복기중', 'junggye-b', ['kind', 'steady'], ['kind']),
  u('u6', '축제기획단', 'junggye-c'),
  u('u7', '고2의무게', 'daechi-a'),
  u('u8', '탐구러', 'mokdong-a', ['all1', 'math1'], ['all1']),
  u('u9', '버스맨뒷자리', 'junggye-a'),
  u('u10', '플래너중독', 'daechi-b', ['share'], ['share']),
  u('u11', '말랑젤리', 'mokdong-b'),
  u('u12', '입시궁금러', 'junggye-b'),
  u('u13', '체육시간최고', 'daechi-c'),
  u('u14', '국어는감', 'junggye-c', ['kind', 'steady'], ['kind', 'steady']),
  u('u15', '수학포기안함', 'daechi-a', ['math1'], ['math1']),
  u('u16', '동네산책러', 'mokdong-a'),
];

function u(id: string, nickname: string, schoolId: string, owned: BadgeId[] = [], shown: BadgeId[] = []): User {
  return { id, nickname, schoolId, verified: true, ownedBadges: owned, shownBadges: shown };
}

interface SeedPost {
  id: string;
  author: string;
  category: CategoryId;
  title: string;
  body: string;
  minutesAgo: number;
  likes: number;
  comments: [author: string, body: string][];
}

const SEED_POSTS: SeedPost[] = [
  // 10월 모의고사 주제 (4판에 추가)
  {
    id: 'p-o1', author: 'u5', category: 'study', minutesAgo: 50, likes: 27,
    title: '10모 끝나고 국어 시간 배분 다시 짜는 중',
    body: '10모 풀어 보니까 독서에서 시간이 생각보다 많이 새더라. 다음 모의고사 때는 문학 먼저 풀고 독서로 넘어가 보려고 하는데, 순서 바꿔 본 사람 있어?',
    comments: [
      ['u14', '나는 문학 먼저 했더니 마음이 편했어. 대신 독서 마지막 지문은 꼭 시간 체크!'],
      ['u2', '순서보다 지문마다 제한 시간 정해 두는 게 더 도움 됐음'],
    ],
  },
  {
    id: 'p-o2', author: 'u12', category: 'daily', minutesAgo: 110, likes: 33,
    title: '10모 성적표 보고 멘탈 관리 어떻게 해?',
    body: '생각보다 등급이 안 나와서 하루 종일 기분이 별로였어. 다들 성적표 나오면 어떻게 털고 다시 공부해?',
    comments: [
      ['u16', '나는 그날은 그냥 쉬고 다음 날 틀린 것만 다시 봐'],
      ['u5', '등급보다 틀린 유형을 보는 게 마음이 덜 흔들리더라'],
    ],
  },
  {
    id: 'p-d6', author: 'u3', category: 'daily', minutesAgo: 25, likes: 64,
    title: '급식 오늘 마라샹궈 나옴',
    body: '우리 학교 급식 진짜 도전정신 최고… 맛도 생각보다 괜찮았음. 다들 학교 급식 레전드 메뉴 뭐였어?',
    comments: [
      ['u9', '우리 학교는 탕후루 나온 적 있음ㅋㅋ'],
      ['u7', '부럽다… 우리는 맨날 카레'],
      ['u12', '마라샹궈 급식은 처음 들어봄 ㄷㄷ'],
    ],
  },
  {
    id: 'p-t1', author: 'u2', category: 'study', minutesAgo: 70, likes: 72,
    title: '수학 오답노트 다들 어떻게 정리함?',
    body: '문제 오려 붙이고 풀이 다시 쓰는 방식이었는데 시간이 너무 오래 걸려서 바꾸려고 함.\n요즘은 "왜 틀렸는지" 한 줄이랑 다시 풀 날짜만 적는 중. 다른 방법 있으면 공유해줘',
    comments: [
      ['u15', '나도 틀린 이유 한 줄 + 비슷한 유형 번호 적는 방식으로 바꿨는데 훨씬 빨라짐'],
      ['u5', '다시 풀 날짜 적는 거 좋다. 나는 일주일 뒤에 다시 풀기 해'],
      ['u10', '태블릿으로 캡처해서 단원별 폴더에 정리 중. 출력 안 해도 돼서 편함'],
    ],
  },
  {
    id: 'p-s1', author: 'u6', category: 'school', minutesAgo: 140, likes: 41,
    title: '학교 축제 부스 뭐가 제일 재밌었어?',
    body: '올해 축제 부스 기획 맡았는데 아이디어가 고갈됨… 방탈출이랑 포토부스는 작년에 했어. 다른 학교에서 반응 좋았던 거 있으면 공유해줘!',
    comments: [
      ['u4', '작년에 우리 학교 추억의 문방구 콘셉트 부스 줄 엄청 길었음'],
      ['u13', '랜덤 플레이 댄스 하면 사람 엄청 모여'],
      ['u3', '타로 부스! 진짜 맞히는 건 아닌데 다들 재밌어함'],
    ],
  },
  {
    id: 'p-a1', author: 'u12', category: 'admission', minutesAgo: 200, likes: 61,
    title: '입시 상담 갈 때 질문 뭐 준비해 가면 좋을까?',
    body: '다음 달에 학교 진로 상담 처음 가는데 뭘 물어봐야 할지 모르겠어. 막연하게 "어디 갈 수 있어요?" 말고 구체적으로 물어볼 만한 거 있을까?',
    comments: [
      ['u14', '지금 성적으로 어떤 방향이 맞을지, 다음 학기에 뭘 보완하면 좋을지 물어봤어'],
      ['u8', '관심 학과 2~3개 정해서 가면 대화가 훨씬 구체적이 돼'],
      ['u15', '궁금한 거 미리 메모장에 적어가기! 막상 가면 까먹음'],
    ],
  },
  {
    id: 'p-d1', author: 'u1', category: 'daily', minutesAgo: 290, likes: 48,
    title: '야자 끝나고 집 가면 공부 더 해?',
    body: '10시에 야자 끝나고 집 오면 10시 반인데 씻고 나면 11시… 여기서 더 하는 사람들 진짜 대단함.\n나는 영단어만 보고 자는데 이거라도 하는 게 맞는지 모르겠음. 다들 몇 시까지 해?',
    comments: [
      ['u4', '나도 11시부터 딱 1시간만 하고 잠. 그 1시간이 은근 쌓이더라'],
      ['u15', '영단어라도 하는 게 어디야. 잠 줄였더니 다음 날 야자 때 졸려서 오히려 손해였음'],
      ['u9', '집 오면 그냥 기절… 대신 아침에 30분 일찍 일어나서 함'],
    ],
  },
  {
    id: 'p-t2', author: 'u5', category: 'study', minutesAgo: 380, likes: 46,
    title: '모고 끝나고 복기할 때 어떤 순서로 해?',
    body: '채점 → 틀린 문제 → 찍은 문제 순서로 하는데, 시간 관리 복기는 따로 안 하고 있었음. 시험지에 푼 순서랑 시간 적어두는 사람 있어?',
    comments: [
      ['u2', '푼 순서랑 각 파트 끝난 시각 적어두면 어디서 시간 새는지 보여서 좋아'],
      ['u8', '찍어서 맞힌 문제도 틀린 걸로 치고 복기해'],
    ],
  },
  {
    id: 'p-s2', author: 'u7', category: 'school', minutesAgo: 460, likes: 53,
    title: '수행평가랑 내신 준비 겹칠 때 시간 배분',
    body: '다음 주에 수행 3개(발표, 보고서, 실험)가 몰려 있는데 시험도 2주 뒤임. 수행 먼저 끝내는 게 나아? 아니면 매일 조금씩 나눠서 하는 게 나아?',
    comments: [
      ['u5', '마감 빠른 수행부터 끝내고 남는 시간에 시험공부 나눠서 하는 편'],
      ['u10', '나는 하루 계획을 "수행 1 : 시험 2" 비율로 짬. 수행이 의외로 시간 많이 잡아먹음'],
      ['u14', '보고서는 초안만 빨리 써두면 나머지가 편해져'],
    ],
  },
  {
    id: 'p-d3', author: 'u11', category: 'daily', minutesAgo: 560, likes: 57,
    title: '같은 학교 친구들한테 묻기 애매한 고민',
    body: '친구들이랑 진로가 점점 갈리니까 대화 주제가 안 맞는 느낌이 들어. 서운한 건 아닌데 뭔가 혼자 된 기분?\n다른 학교 사람들한테 물어보는 게 오히려 편해서 써봄. 다들 이럴 때 어떻게 해?',
    comments: [
      ['u14', '나도 그랬는데 진로 얘기 말고 다른 걸로 이야기하다 보니 괜찮아지더라'],
      ['u5', '학교 밖에 얘기할 데가 있으면 숨통이 트여. 여기 쓴 것도 잘한 듯'],
      ['u16', '각자 바쁜 시기라 그런 것 같아. 너무 혼자라고 생각하지 마'],
    ],
  },
  {
    id: 'p-a5', author: 'u11', category: 'admission', minutesAgo: 700, likes: 50,
    title: '희망 학과 아직 없는 사람 나만 그래?',
    body: '주변은 다 학과 정했다는데 나는 하고 싶은 게 너무 많거나 하나도 없거나 둘 중 하나임. 늦게 정해도 괜찮았던 경험 있으면 듣고 싶어',
    comments: [
      ['u6', '나도 고2 끝날 때쯤 정했어. 늦어서 손해 본 느낌은 별로 없었음'],
      ['u14', '좋아하는 과목에서 거꾸로 생각해 보는 것도 방법!'],
    ],
  },
  {
    id: 'p-t4', author: 'u14', category: 'study', minutesAgo: 820, likes: 58,
    title: '비문학 시간 줄인 방법 (내 경우)',
    body: '지문 하나에 10분 넘게 걸리던 때가 있었는데, 문단마다 핵심 단어 하나만 표시하는 연습을 하고 나서 좀 줄었어.\n완벽한 방법은 아니지만 비슷한 고민 있는 사람 참고해!',
    comments: [
      ['u1', '문단마다 한 단어 표시 따라 해봐야겠다. 고마워'],
      ['u12', '나도 시간 부족한데 참고할게!'],
    ],
  },
  {
    id: 'p-d2', author: 'u9', category: 'daily', minutesAgo: 950, likes: 31,
    title: '버스에서 잠들어서 두 정거장 지나침',
    body: '어제 학원 끝나고 버스 탔는데 눈 떠보니 처음 보는 동네였음ㅋㅋ 나만 이래? 요즘 피곤한 게 장난 아님',
    comments: [
      ['u3', 'ㅋㅋㅋ 나는 종점까지 간 적 있음'],
      ['u13', '내릴 시간에 알람 맞춰두는 거 추천함 진심'],
    ],
  },
  {
    id: 'p-s5', author: 'u12', category: 'school', minutesAgo: 1100, likes: 38,
    title: '조별과제 무임승차 어떻게 해결해?',
    body: '발표 자료 나눠서 하기로 했는데 한 명이 계속 답장이 없어. 선생님께 바로 말하기엔 좀 그렇고… 현명하게 해결해 본 사람?',
    comments: [
      ['u14', '역할이랑 마감일을 단톡에 정리해서 다 같이 보게 하면 좀 나아짐'],
      ['u7', '끝까지 연락 안 되면 선생님께 상황만 담백하게 말씀드리는 게 나았어'],
    ],
  },
  {
    id: 'p-a2', author: 'u7', category: 'admission', minutesAgo: 1250, likes: 44,
    title: '생기부 세특 다들 어떻게 챙겨?',
    body: '수업 시간에 한 활동이 세특에 어떻게 들어가는지 잘 모르겠음. 따로 보고서를 내는 게 맞는지, 수업만 열심히 들으면 되는지 다들 어떻게 하고 있어?',
    comments: [
      ['u10', '학교마다 운영이 달라서 담임쌤께 직접 여쭤보는 게 제일 정확했어'],
      ['u5', '수업 듣다가 궁금했던 걸 더 찾아본 기록을 따로 정리해 두는 중'],
    ],
  },
  {
    id: 'p-t6', author: 'u8', category: 'study', minutesAgo: 1400, likes: 29,
    title: '탐구 개념 한 바퀴 언제까지 돌려?',
    body: '고2 겨울방학에 개념 끝내라는 말을 많이 듣는데 다들 계획 어때? 나는 사회문화 하는 중인데 기출 들어가기 전에 개념을 몇 번 보는지 궁금',
    comments: [
      ['u2', '기출 들어가기 전에 개념 두 번은 보려고 하는 중'],
      ['u5', '개념 1회독 하고 기출 풀면서 모르는 개념을 다시 찾아보는 식으로 했어'],
    ],
  },
  {
    id: 'p-s3', author: 'u4', category: 'school', minutesAgo: 1600, likes: 27,
    title: '동아리 부장 해본 사람?',
    body: '2학기에 부장 맡아 달라는데 공부랑 병행할 수 있을지 궁금함. 도움이 되는지보다 시간 뺏기는 게 더 걱정돼',
    comments: [
      ['u6', '해봤는데 일정 관리만 잘하면 가능함. 대신 시험 2주 전엔 부원들한테 양해 구했어'],
      ['u1', '책임감 때문에 오히려 공부 리듬이 생겼다는 사람도 있더라'],
    ],
  },
  {
    id: 'p-d4', author: 'u13', category: 'daily', minutesAgo: 1800, likes: 22,
    title: '시험 끝난 날 뭐 하고 놀아?',
    body: '다음 주에 시험 끝나는데 벌써 계획 세우는 중. 노래방 → 마라탕 코스 말고 새로운 거 추천 좀',
    comments: [
      ['u1', '보드게임카페 추천. 머리 쓰는데 공부가 아니라서 좋음'],
      ['u6', '한강 가서 자전거 탔는데 생각보다 개운했어'],
    ],
  },
  {
    id: 'p-a3', author: 'u15', category: 'admission', minutesAgo: 2000, likes: 39,
    title: '정시랑 수시 방향 언제 정했어?',
    body: '고2 2학기인데 아직 못 정했음. 내신이 애매해서 고민인데 다들 언제쯤 방향 잡았는지 궁금해',
    comments: [
      ['u7', '나도 아직… 고3 3월 모고 보고 정하겠다는 친구도 꽤 있더라'],
      ['u12', '아는 선배는 둘 다 놓지 않고 가다가 고2 끝나고 정했대'],
    ],
  },
  {
    id: 'p-t3', author: 'u10', category: 'study', minutesAgo: 2300, likes: 24,
    title: '영단어 앱 vs 종이 단어장',
    body: '앱은 편한데 자꾸 다른 앱으로 새고, 종이는 들고 다니기 귀찮고. 결국 뭐가 오래 갔는지 경험담 듣고 싶어요',
    comments: [
      ['u16', '종이 단어장이 오래 갔음. 앱은 알림 끄면 끝이더라'],
      ['u4', '앱으로 외우고 틀린 것만 종이에 옮겨 적는 중'],
    ],
  },
  {
    id: 'p-s4', author: 'u9', category: 'school', minutesAgo: 2600, likes: 33,
    title: '체육대회 반티 투표 갈림ㅋㅋ',
    body: '후보가 잠옷 vs 축구 유니폼으로 갈려서 반이 반으로 나뉨. 너네 반은 뭐 했어? 사진은 못 올리니까 말로 설명해줘',
    comments: [
      ['u13', '잠옷 반티는 사진 찍으면 귀여움 보장'],
      ['u15', '우리 반은 결국 둘 다 안 되고 무난한 흰 티 됨ㅋㅋ'],
    ],
  },
  {
    id: 'p-a6', author: 'u3', category: 'admission', minutesAgo: 2900, likes: 35,
    title: '고1 때 내신 망쳤는데 회복한 사람 있어?',
    body: '고1 1학기 성적이 생각보다 안 나와서 걱정이야. 그 뒤에 끌어올린 경험 있으면 어떤 식으로 했는지 궁금해',
    comments: [
      ['u15', '나 고1 1학기 망쳤는데 2학기부터 복습 루틴 잡고 많이 올랐어'],
      ['u4', '과목별로 왜 안 나왔는지 먼저 따져보는 게 도움 됐음'],
    ],
  },
  {
    id: 'p-d5', author: 'u16', category: 'daily', minutesAgo: 3200, likes: 19,
    title: '요즘 듣는 공부 브금 공유해요',
    body: '가사 없는 로파이만 듣다가 요즘은 빗소리랑 카페 소음 섞인 걸 듣는 중. 집중 잘 되는 거 있으면 알려줘요',
    comments: [['u10', '백색소음이랑 타이머 앱 같이 쓰는 중!']],
  },
  {
    id: 'p-t5', author: 'u4', category: 'study', minutesAgo: 3500, likes: 33,
    title: '스터디카페 vs 집 vs 학교 자습실',
    body: '집중 제일 잘 되는 곳 어디야? 나는 스카 가면 돈 아까워서라도 앉아 있게 되더라',
    comments: [['u9', '학교 자습실이 공짜고 제일 조용함ㅋㅋ']],
  },
  {
    id: 'p-s6', author: 'u10', category: 'school', minutesAgo: 3900, likes: 15,
    title: '점심시간에 도서관 가는 사람',
    body: '우리 학교 도서관은 점심에 열람실 자리 쟁탈전임. 다른 학교도 그래? 점심에 공부하는 게 효율이 있는지도 궁금',
    comments: [],
  },
  {
    id: 'p-a4', author: 'u16', category: 'admission', minutesAgo: 4300, likes: 18,
    title: '대학 탐방 프로그램 가본 사람',
    body: '방학에 캠퍼스 투어 같은 걸 가보려고 하는데 실제로 도움이 됐는지 궁금함. 그냥 구경만 하고 오는 건지',
    comments: [['u11', '가보니까 캠퍼스 분위기 보는 것만으로도 동기부여 됐어']],
  },
];

export function createSeedState(now: number = Date.now()): AppState {
  const posts: Post[] = [];
  const comments: Comment[] = [];

  for (const sp of SEED_POSTS) {
    const createdAt = now - sp.minutesAgo * 60_000;
    posts.push({
      id: sp.id,
      authorId: sp.author,
      category: sp.category,
      title: sp.title,
      body: sp.body,
      createdAt,
      baseLikes: sp.likes,
    });
    // 댓글은 글이 올라온 뒤 지금 사이에 고르게 배치한다.
    const gap = Math.min((now - createdAt) / (sp.comments.length + 1), 45 * 60_000);
    sp.comments.forEach(([author, body], i) => {
      comments.push({
        id: `${sp.id}-c${i + 1}`,
        postId: sp.id,
        authorId: author,
        body,
        createdAt: Math.round(createdAt + gap * (i + 1)),
      });
    });
  }

  return {
    version: 5,
    users: SEED_USERS.map((x) => ({ ...x, ownedBadges: [...x.ownedBadges], shownBadges: [...x.shownBadges] })),
    posts,
    comments,
    currentProfileId: null,
    profiles: {},
    reports: [],
    theme: 'light',
    links: [...createCuratedLinks(now), ...createSeedLinks(now)],
    linkPrefs: { ...DEFAULT_LINK_PREFS },
  };
}

// 예시 카드는 기본으로 숨긴다(5판, 사용자 요청). 설정에서 다시 켤 수 있다.
export const DEFAULT_LINK_PREFS: LinkPrefs = { saved: [], hidden: [], excludedSources: [], showExamples: false, searches: [] };

/** 4판에서 새로 넣은 RECESS 예시 글. 이전 판 데이터에 한 번만 더한다. */
export const V4_POST_IDS = ['p-o1', 'p-o2'];

// 피드 중간에 끼워 넣는 광고. 학원·브랜드 이름은 모두 가상이다.
export const ADS = {
  academy: {
    id: 'ad-academy',
    label: '광고 · 자체 운영 학원 예시',
    name: '쉼표학원 (가상)',
    area: '대치 · 중계',
    title: '탐구 실전 관리반',
    summary: '매주 실전 모의고사 → 1:1 피드백 → 그날 다시 풀기',
    description:
      '한 주에 한 번 실전처럼 모의고사를 보고, 틀린 문항은 바로 1:1로 짚은 뒤 그날 안에 다시 풀어 보는 관리형 수업이에요.',
    points: [
      { title: '실전 모의고사', text: '매주 같은 시간, 실제 시험과 같은 조건으로 풀어요.' },
      { title: '1:1 피드백', text: '틀린 이유를 함께 확인하고 다음에 볼 개념을 정해요.' },
      { title: '그날 다시 풀기', text: '오답을 정리한 뒤 같은 문항을 다시 풀어 마무리해요.' },
    ],
    facts: [
      { label: '대상', value: '고2 · 고3' },
      { label: '과목', value: '사회문화 · 생활과윤리' },
      { label: '수업', value: '주 1회 (예시 일정)' },
      { label: '수강료', value: '상담 시 안내 (예시)' },
    ],
    subjects: ['사회문화', '생활과윤리', '아직 정하지 못했어요'],
    times: ['평일 저녁', '토요일', '일요일'],
    grades: ['고1', '고2', '고3'],
  },
  planner: {
    id: 'ad-planner',
    label: '광고',
    name: '하루노트 (가상 브랜드)',
    title: '시험 기간 스터디 플래너',
    summary: '하루를 30분 단위로 나눠 계획하고, 저녁에 한 줄 회고를 남기는 플래너',
    description:
      '과목별 색 스티커와 주간 점검 페이지가 들어 있는 종이 플래너예요. 이 광고는 피드 광고가 어떻게 보이는지 보여주는 예시예요.',
  },
};
