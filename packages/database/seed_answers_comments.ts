import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function seedAnswersAndComments() {
  console.log(
    "🚀 Phase 4 & 5: 답변과 댓글 생성 (한국시간: " +
      new Date().toLocaleString("ko-KR") +
      ")"
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // 전문가 사용자 조회
  const experts = await prisma.user.findMany({
    where: {
      nickname: {
        in: [
          "parktourexpert",
          "kimfoodexpert",
          "leefoodexpert",
          "junghotel",
          "choitransport",
          "shoppingexpert",
          "hanactivity",
          "weatherexpert",
          "safexpert",
          "etcexpert",
        ],
      },
    },
  });

  // 일반사용자 조회
  const users = await prisma.user.findMany({
    where: {
      nickname: {
        in: [
          "autumntravel",
          "springouting",
          "summervacation",
          "winterwalk",
          "jejunative",
          "seoulvisitor",
          "busantravel",
          "daegtourist",
          "incheontrip",
          "gwangjuexplorer",
        ],
      },
    },
  });

  // 질문 조회
  const questions = await prisma.question.findMany({
    take: 18,
  });

  // 맞춤 답변 데이터
  const answerData = [
    // 질문 0: 성산일출봉
    {
      qIndex: 0,
      expertNickname: "parktourexpert",
      content:
        "성산일출봉 일출은 새벽 5시 30분 경이 가장 좋습니다! 주차장은 새벽 4시부터 찬 바람이 많으니 따뜻하게 입고 가세요. 계단이 좀 가파르지만 30분이면 충분합니다.",
    },
    {
      qIndex: 0,
      expertNickname: "weatherexpert",
      content:
        "성산일출봉 일출 시간은 계절마다 달라집니다. 10월 현재 아침 6시 40분 경입니다. 날씨를 미리 확인하고 가시는 것을 추천합니다!",
    },
    // 질문 1: 한라산 등산
    {
      qIndex: 1,
      expertNickname: "parktourexpert",
      content:
        "한라산은 3가지 코스가 있습니다. 초심자는 관음사 코스(약 4시간)를 추천합니다. 등산화와 충분한 물을 준비하세요!",
    },
    // 질문 2: 검은콩 쌀국수
    {
      qIndex: 2,
      expertNickname: "kimfoodexpert",
      content:
        "제주 명물 검은콩 쌀국수는 비자림로 근처 '송이네'를 추천합니다. 진짜 현지인들이 많이 가는 곳이고 가격도 저렴합니다. 꼭 가보세요!",
    },
    {
      qIndex: 2,
      expertNickname: "leefoodexpert",
      content:
        "또 다른 추천은 '흑돼지쌀국수'입니다. 검은콩 쌀국수에 흑돼지를 곁들인 독특한 메뉴가 있어요. 10년 이상 운영 중인 오래된 식당입니다.",
    },
    // 질문 3: 회전초밥
    {
      qIndex: 3,
      expertNickname: "leefoodexpert",
      content:
        "애월읍 회전초밥은 '오감도'를 강력 추천합니다! 신선한 해산물을 매일 직수입하고, 가성비도 좋아요. 평일 오후 2-4시가 한산합니다.",
    },
    // 질문 4: 가족 숙박
    {
      qIndex: 4,
      expertNickname: "junghotel",
      content:
        "가족 3명이면 투룸 게스트하우스를 추천합니다. 중문 관광단지 근처 '파라다이스 펜션'은 아이들 놀 공간도 있고 청결도 좋습니다. 1박에 8만원대입니다.",
    },
    // 질문 5: 중문 호텔
    {
      qIndex: 5,
      expertNickname: "junghotel",
      content:
        "중문 관광단지 주변 호텔 중 가성비 최고는 '신라 호텔' 근처의 '제주 파크 호텔'입니다. 깨끗하고 위치도 최고입니다. 온라인 할인가로 1박에 15만원 정도예요.",
    },
    // 질문 6: 공항 교통
    {
      qIndex: 6,
      expertNickname: "choitransport",
      content:
        "제주공항에서 시내(화순/중앙로)로 가는 가장 편한 방법은 리무진 버스입니다. 약 50분에 8000원이고 호텔 바로 앞에 내려줍니다!",
    },
    // 질문 7: 렌터카 비용
    {
      qIndex: 7,
      expertNickname: "choitransport",
      content:
        "3일 렌터카는 대략 3만원대입니다. 공항 렌터카 회사들이 경쟁이 심해서 예약하면 더 저렴합니다. 보험은 필수로 드세요!",
    },
    // 질문 8: 면세점
    {
      qIndex: 8,
      expertNickname: "shoppingexpert",
      content:
        "신라면세점 화장품 추천: 롤렉스 스킨케어 풀세트(약 30% 할인), 에스티로더 더블웨어 파운데이션이 최저가입니다. 꼭 파스포트 꺼내놓고 계산하세요!",
    },
    // 질문 9: 기념품
    {
      qIndex: 9,
      expertNickname: "shoppingexpert",
      content:
        "제주 특산품은 '롯데 면세점' 근처 '한라산 기념품 거리'에서 사는 게 가장 저렴합니다. 감귤, 흑설탕, 비자오일 등이 원가 수준입니다!",
    },
    // 질문 10: 스노클링
    {
      qIndex: 10,
      expertNickname: "hanactivity",
      content:
        "제주도 스노클링은 '협재 해수욕장'과 '함덕 해수욕장'을 추천합니다! 물이 맑고 산호초도 많아요. 오전 10시-오후 2시가 최고의 능견도입니다.",
    },
    // 질문 11: 트래킹
    {
      qIndex: 11,
      expertNickname: "hanactivity",
      content:
        "한라산 트래킹 난이도: 관음사/영실코스는 중상, 성판악코스는 중급입니다. 처음이면 관음사 코스 추천! 최소 3시간 소요됩니다.",
    },
    // 질문 12: 10월 날씨
    {
      qIndex: 12,
      expertNickname: "weatherexpert",
      content:
        "10월 제주도 평균기온은 20도 전후입니다. 얇은 가디건과 운동화면 충분해요. 간혹 태풍이 올 수 있으니 미리 확인하세요!",
    },
    // 질문 13: 겨울복장
    {
      qIndex: 13,
      expertNickname: "weatherexpert",
      content:
        "12월 제주도는 12-15도 수준입니다. 숨이 나올 정도는 안 춥지만, 얇은 내복+얇은 코트+목도리 정도는 필수입니다. 서풍이 강해요!",
    },
    // 질문 14: 안전정보
    {
      qIndex: 14,
      expertNickname: "safexpert",
      content:
        "제주도 여행 안전: 1)바다 근처에서는 항상 주의 2)화산암이 날카로우니 등산화 필수 3)밤길도 비교적 안전합니다. 카페에서 짐 두고 나가는 일만 피하세요!",
    },
    // 질문 15: 야간활동
    {
      qIndex: 15,
      expertNickname: "safexpert",
      content:
        "제주도 야간은 비교적 안전합니다. 중앙로/애월읍 밤거리는 사람도 많고 깨끗해요. 다만 외진 산길은 피하는 게 좋습니다!",
    },
    // 질문 16: 관광팁
    {
      qIndex: 16,
      expertNickname: "etcexpert",
      content:
        "처음 여행 팁: 1)여권 여사본 확인 2)카페 와이파이 암호 미리 확인 3)신용카드 4장 이상 챙기기 4)애플머니/삼성페이 등록 5)한국관광공사 앱 다운!",
    },
    // 질문 17: 물값
    {
      qIndex: 17,
      expertNickname: "etcexpert",
      content:
        "제주도 편의점 생수(1L) 가격은 2000원으로 일반 지역과 같습니다. 카페 음료는 1000원 정도 비싼 편이니 편의점에서 사가세요!",
    },
  ];

  let answerCount = 0;
  let commentCount = 0;

  for (const ansData of answerData) {
    const question = questions[ansData.qIndex];
    if (!question) continue;

    // 해당 전문가 찾기
    const expert = experts.find(e => e.nickname === ansData.expertNickname);
    if (!expert) continue;

    // 답변 생성
    const answer = await prisma.answer.create({
      data: {
        id: `ans_${uuidv4()}`,
        content: ansData.content,
        authorId: expert.id,
        questionId: question.id,
        status: "ACTIVE",
        isAccepted: false,
        likeCount: Math.floor(Math.random() * 10) + 1,
      },
    });

    answerCount++;

    // 각 답변에 2-4개의 댓글 추가
    const commentCountPerAnswer = Math.floor(Math.random() * 3) + 2; // 2-4개

    for (let i = 0; i < commentCountPerAnswer; i++) {
      // 랜덤 사용자 선택
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // 주기적으로 전문가도 댓글달기 (50% 확률)
      const commenterIsExpert = Math.random() > 0.5;
      const commenter = commenterIsExpert
        ? experts[Math.floor(Math.random() * experts.length)]
        : randomUser;

      const commentContents = [
        "정말 유용한 정보 감사합니다! 꼭 가봐야겠어요.",
        "완전 도움이 됐습니다. 이 정보 찾느라 고생했는데 한 번에 해결됐네요!",
        "와 정말 상세하네요. 가격 정보까지 있으니 너무 좋습니다!",
        "혹시 최근에 가보셨어요? 정보가 최신인지 궁금합니다.",
        "이곳 정말 추천합니다! 저도 작년에 갔는데 정말 좋았어요.",
        "예약이 필요한가요? 미리 알려주시면 감사하겠습니다!",
        "다른 추천 장소도 있으신가요?",
        "감사합니다! 저도 비슷한 경험이 있어서 댓글 남깁니다.",
        "정말 정확한 정보네요. 앞으로 참고하겠습니다!",
        "현지인의 조언이라 더 신뢰가 가네요! 감사합니다.",
      ];

      const randomComment =
        commentContents[Math.floor(Math.random() * commentContents.length)];

      await prisma.answerComment.create({
        data: {
          id: `acmt_${uuidv4()}`,
          content: randomComment,
          authorId: commenter.id,
          answerId: answer.id,
          likeCount: Math.floor(Math.random() * 5),
        },
      });

      commentCount++;
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ 답변 생성 완료: ${answerCount}개`);
  console.log(`✅ 댓글 생성 완료: ${commentCount}개`);
  console.log(
    `📊 총 데이터: 18개 질문 + ${answerCount}개 답변 + ${commentCount}개 댓글`
  );

  await prisma.$disconnect();
}

seedAnswersAndComments().catch(console.error);
