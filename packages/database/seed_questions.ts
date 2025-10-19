import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function seedQuestions() {
  // 먼저 사용자들을 조회
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

  const questions = [
    {
      categoryId: "cat_001",
      authorId: users[0].id,
      title: "성산일출봉 가는 길 추천해주세요",
      content: "성산일출봉에서 일출을 보고 싶은데 가장 좋은 시간이 언제예요?",
    },
    {
      categoryId: "cat_001",
      authorId: users[1].id,
      title: "제주도 한라산 등산코스 조언",
      content:
        "한라산 등산을 계획 중인데 초심자도 오를 수 있는 코스가 있을까요?",
    },
    {
      categoryId: "cat_002",
      authorId: users[2].id,
      title: "제주도 검은콩 쌀국수 맛집",
      content: "제주도에 유명한 검은콩 쌀국수 맛집이 있다고 들었는데 어디예요?",
    },
    {
      categoryId: "cat_002",
      authorId: users[3].id,
      title: "애월읍 해산물 회전초밥 추천",
      content: "애월읍 근처에 신선한 회전초밥 맛집이 있을까요?",
    },
    {
      categoryId: "cat_003",
      authorId: users[4].id,
      title: "제주도 가족 여행 숙박 추천",
      content: "가족 3명이서 묵을 수 있는 깨끗한 숙소 추천해주세요",
    },
    {
      categoryId: "cat_003",
      authorId: users[5].id,
      title: "중문 관광단지 주변 호텔",
      content: "중문 관광단지 주변에 괜찮은 가격의 호텔이 있나요?",
    },
    {
      categoryId: "cat_004",
      authorId: users[6].id,
      title: "공항에서 시내로 가는 방법",
      content: "제주 공항 도착 후 시내로 가는 가장 편한 방법은 뭐예요?",
    },
    {
      categoryId: "cat_004",
      authorId: users[7].id,
      title: "렌터카 비용은 어느정도",
      content: "3일간 렌터카를 이용하면 대략 얼마 정도 드나요?",
    },
    {
      categoryId: "cat_005",
      authorId: users[8].id,
      title: "제주 신라면세점 쇼핑",
      content: "신라면세점에서 추천하는 상품이 있을까요?",
    },
    {
      categoryId: "cat_005",
      authorId: users[9].id,
      title: "로컬 기념품 구입처",
      content: "제주도의 특산물이나 로컬 기념품은 어디서 살 수 있어요?",
    },
    {
      categoryId: "cat_006",
      authorId: users[0].id,
      title: "제주도 스노클링 추천지",
      content: "제주도에서 스노클링하기 좋은 장소는 어디예요?",
    },
    {
      categoryId: "cat_006",
      authorId: users[1].id,
      title: "한라산 트래킹 난이도",
      content: "한라산 트래킹은 어느 정도 난이도일까요?",
    },
    {
      categoryId: "cat_007",
      authorId: users[2].id,
      title: "10월 제주도 날씨",
      content: "10월에 제주도 여행을 가는데 날씨가 어떨까요?",
    },
    {
      categoryId: "cat_007",
      authorId: users[3].id,
      title: "겨울 제주도 여행복장",
      content: "12월에 제주도 여행을 가는데 어떤 옷을 입어야 할까요?",
    },
    {
      categoryId: "cat_008",
      authorId: users[4].id,
      title: "제주도 여행 안전정보",
      content: "제주도 여행 시 주의해야 할 안전사항이 있나요?",
    },
    {
      categoryId: "cat_008",
      authorId: users[5].id,
      title: "야간 활동 안전성",
      content: "제주도에서 밤에 돌아다녀도 안전한가요?",
    },
    {
      categoryId: "cat_009",
      authorId: users[6].id,
      title: "제주도 관광 팁",
      content: "처음 제주도 여행 가는데 뭘 챙기면 좋을까요?",
    },
    {
      categoryId: "cat_009",
      authorId: users[7].id,
      title: "제주도 물값 정보",
      content: "제주도에서 생수나 음료수 가격이 비싼 편인가요?",
    },
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: {
        id: `q_${uuidv4()}`,
        title: q.title,
        content: q.content,
        authorId: q.authorId,
        categoryId: q.categoryId,
        status: "ACTIVE",
        isResolved: false,
        isPinned: false,
        viewCount: 0,
        likeCount: 0,
        answerCount: 0,
      },
    });
  }

  console.log("✅ 18개 질문 생성 완료!");
  await prisma.$disconnect();
}

seedQuestions().catch(console.error);
