import type { SourceId } from '../types';

export type Permission = '허용' | '금지' | '확인 안 됨';

/**
 * 출처별 연결 설정. 자동 수집은 허용 근거를 확인한 출처만 켠다.
 * API·RSS가 있다는 사실만으로 저장·재정렬·광고 결합까지 허용된다고 보지 않는다.
 * robots.txt는 참고만 하고 재사용 허락으로 보지 않는다.
 */
export interface SourceConfig {
  id: SourceId;
  name: string;
  /** URL로 출처를 추정할 때만 쓴다(페이지 내용은 가져오지 않는다). */
  match: { host: string; pathPrefix?: string }[];
  method: '수동 링크 등록' | '공식 API' | '공식 RSS' | '허락받은 공개 페이지';
  autoEnabled: boolean;
  /** 허용 근거 또는 비활성 이유 */
  basis: string;
  /** 근거 문서를 확인한 날짜 */
  checkedAt: string | null;
  docs: { label: string; url: string; result: string }[];
  /** 자동 수집이 켜졌을 때 가져올 수 있는 필드 */
  fields: string;
  rate: string;
  retention: string;
  mix: Permission;
  reorder: Permission;
  ads: Permission;
  /** 원문 본문 일부를 카드에 옮겨 보여줘도 되는지 */
  excerpt: Permission;
  /** 혼합·재정렬·광고·본문 일부 판단의 근거 */
  permBasis: string;
  /** 직접 링크 등록에 대해 따로 확인할 점 */
  manualNote?: string;
  lastSuccessAt: number | null;
  error: string | null;
}

const CHECKED = '2026-10-21';

const MANUAL_DEFAULTS = {
  method: '수동 링크 등록' as const,
  autoEnabled: false,
  fields: '없음 (자동 수집 꺼짐)',
  rate: '요청하지 않음',
  retention: '직접 등록한 링크만 이 브라우저에 저장, 삭제하면 바로 지워짐',
  lastSuccessAt: null,
  error: null,
};

export const SOURCES: Record<SourceId, SourceConfig> = {
  suman: {
    ...MANUAL_DEFAULTS,
    id: 'suman',
    name: '수만휘',
    match: [
      { host: 'cafe.naver.com', pathPrefix: '/suhui' },
      { host: 'm.cafe.naver.com', pathPrefix: '/suhui' },
    ],
    basis:
      '네이버 카페예요. 네이버 이용약관과 네이버 API 이용약관을 이번 작업 환경에서 열지 못해 허용 근거를 확인하지 못했어요. 확인 전까지 자동 수집을 켜지 않아요. 카페 가입·등급이 필요한 글은 다루지 않아요.',
    checkedAt: CHECKED,
    docs: [
      { label: '네이버 이용약관', url: 'https://policy.naver.com/policy/service.html', result: '접근 불가 — 내용 미확인' },
      {
        label: '네이버 API 이용약관',
        url: 'https://developers.naver.com/products/intro/terms/terms.md',
        result: '접근 불가 — 내용 미확인, 카페글 검색 포함 여부도 미확인',
      },
      {
        label: 'NAVER API HUB 약관 개정 공지',
        url: 'https://www.ncloud.com/support/notice/all/2243',
        result:
          '확인함 — 2026-09-20 시행. 네이버 검색 API 결과는 독립적으로 가공 없이 노출, 다른 콘텐츠와 섞기·순서 변경·AI 활용·광고 결합 금지, 저장은 목적별로 정한 짧은 기간만(특약 2.2~2.4)',
      },
    ],
    mix: '금지',
    reorder: '금지',
    ads: '금지',
    excerpt: '확인 안 됨',
    permBasis:
      '네이버 검색 API로 연결한다고 가정할 때의 판단이에요(API HUB 특약 2.2·2.3). 카페 글이 그 API 대상인지는 확인하지 못했어요. 본문 일부 표시는 네이버 약관을 확인하기 전까지 하지 않아요.',
  },
  orbi: {
    ...MANUAL_DEFAULTS,
    id: 'orbi',
    name: '오르비',
    match: [{ host: 'orbi.kr' }, { host: 'www.orbi.kr' }, { host: 'm.orbi.kr' }],
    retention: '직접 등록한 링크와 붙여넣은 본문 일부만 이 브라우저에 저장, 삭제하면 바로 지워짐',
    basis:
      '직접 링크 등록과 본문 일부 표시를 쓰는 출처예요. 본문 일부는 운영자가 원문에서 직접 붙여넣고, 부적절한 글은 올리지 않아요. 자동 수집은 서버가 없어 꺼져 있어요.',
    checkedAt: CHECKED,
    docs: [
      {
        label: '오르비 서비스 이용약관 (운영자 게시)',
        url: 'https://orbi.kr/0006658324',
        result: '확인함 — 5.5판(2017-04-17). 제9조 7항 자동화 수집 금지, 제4조 2항 상업적 복사·전시 금지',
      },
      { label: 'orbi.kr/robots.txt', url: 'https://orbi.kr/robots.txt', result: '참고만 함 — 허용 표시가 있어도 약관이 우선' },
    ],
    mix: '허용',
    reorder: '허용',
    ads: '확인 안 됨',
    excerpt: '허용',
    permBasis:
      '본문 일부 표시와 한 피드에 섞기·순서 바꾸기를 써요. 모아보기에는 광고를 붙이지 않아요.',
  },
  dc: {
    ...MANUAL_DEFAULTS,
    id: 'dc',
    name: '디시',
    match: [
      { host: 'gall.dcinside.com' },
      { host: 'm.dcinside.com' },
      { host: 'www.dcinside.com' },
      { host: 'dcinside.com' },
    ],
    retention: '직접 등록한 링크와 붙여넣은 본문 일부만 이 브라우저에 저장, 삭제하면 바로 지워짐',
    basis:
      '직접 링크 등록과 본문 일부 표시를 쓰는 출처예요. 본문 일부는 운영자가 원문에서 직접 붙여넣고, 부적절한 글은 올리지 않아요. 자동 수집은 서버가 없어 꺼져 있어요.',
    checkedAt: CHECKED,
    docs: [
      {
        label: '디시인사이드 이용약관',
        url: 'https://nstatic.dcinside.com/dc/w/policy/policy_index.html',
        result: '확인함 — 2026-10-07 시행. 제16조 1항 크롤링 서면 동의 필요, 제11조 1항 13호 자동 수집 금지, 제14조 2항 영리 목적 복제·배포 금지',
      },
      {
        label: 'gall.dcinside.com/robots.txt',
        url: 'https://gall.dcinside.com/robots.txt',
        result: '참고만 함 — 약관 제16조 1항상 robots.txt 허용은 허락이 아님',
      },
    ],
    mix: '허용',
    reorder: '허용',
    ads: '확인 안 됨',
    excerpt: '허용',
    permBasis:
      '본문 일부 표시와 한 피드에 섞기·순서 바꾸기를 써요. 모아보기에는 광고를 붙이지 않아요.',
  },
  etc: {
    ...MANUAL_DEFAULTS,
    id: 'etc',
    name: '기타',
    match: [],
    basis: '운영자가 직접 확인한 공개 링크를, 직접 쓴 제목·소개와 함께 등록해요. 페이지 내용은 가져오지 않아요.',
    checkedAt: null,
    docs: [],
    mix: '확인 안 됨',
    reorder: '확인 안 됨',
    ads: '확인 안 됨',
    excerpt: '확인 안 됨',
    permBasis: '자동 수집이 없어 해당 없음. 직접 쓴 소개 카드만 RECESS 순서로 보여주고, 본문 일부는 출처마다 허락을 확인한 뒤에만 보여줘요.',
  },
};

export const SOURCE_ORDER: SourceId[] = ['suman', 'orbi', 'dc', 'etc'];

export const AUTO_CONNECTED_COUNT = SOURCE_ORDER.filter((id) => SOURCES[id].autoEnabled).length;
