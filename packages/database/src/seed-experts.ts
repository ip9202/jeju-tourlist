import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 한국식 닉네임 생성 함수
const firstNames = [
  "김",
  "이",
  "박",
  "최",
  "정",
  "강",
  "조",
  "윤",
  "장",
  "임",
  "한",
  "오",
  "서",
  "신",
  "곽",
  "변",
  "전",
  "송",
  "홍",
  "표",
];
const lastNames = [
  "제주",
  "여행",
  "나그네",
  "전문가",
  "가이드",
  "마스터",
  "러버",
  "로버",
  "마니아",
  "헌터",
  "탐험",
  "여행자",
  "돌핀",
  "씨드",
  "펭귄",
  "독수리",
  "매",
  "호랑",
  "늑대",
  "여우",
];

function generateKoreanNickname(index: number): string {
  const firstName = firstNames[index % firstNames.length];
  const lastName =
    lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  return `${firstName}${lastName}_${String(index).padStart(3, "0")}`;
}

function generateEmail(nickname: string): string {
  return `${nickname}@test.com`.toLowerCase();
}

// 카테고리 선택
const categoryNames = ["맛집", "교통", "액티비티", "숙박", "쇼핑", "관광지"];

// 샘플 답변 내용
const answerTemplates = {
  맛집: [
    "이 음식점은 정말 추천할 만합니다! 신선한 재료를 사용하고 맛도 훌륭해요.",
    "제주도에서 가장 맛있는 {음식} 집이에요. 꼭 가보세요!",
    "현지인들이 자주 가는 숨은 맛집입니다. 가격도 착하고 양도 많아요.",
    "해산물이 신선하고 조리가 정말 잘되어 있어요. 강력 추천합니다!",
    "오랜 전통을 지켜온 맛집이에요. 제주도 여행 필수 코스입니다.",
  ],
  교통: [
    "제주도는 렌터카를 추천드려요. 자유로운 일정으로 여행할 수 있거든요.",
    "대중교통도 잘 되어 있지만 렌터카가 더 효율적입니다.",
    "버스와 택시를 잘 이용하면 저렴하게 여행할 수 있어요.",
    "공항에서 렌터카를 빌리면 약 50,000원 정도 예상하세요.",
    "제주도의 주요 관광지는 차로 30분 이내에 도달 가능합니다.",
  ],
  액티비티: [
    "스노클링은 정말 추천합니다! 제주의 바다가 정말 아름다워요.",
    "서핑을 좋아하시면 중문해변이 최고예요.",
    "트래킹 코스로는 한라산이 최고입니다. 날씨가 좋은 날에 가세요!",
    "카약이나 수상스키도 정말 재미있어요. 가족 여행에 추천합니다.",
    "다이빙 스팟도 많은데, 초보자용 프로그램도 있습니다.",
  ],
  숙박: [
    "펜션은 가족 여행에 최고의 선택입니다. 주방이 있어서 편해요.",
    "게스트하우스는 가성비가 정말 좋습니다.",
    "리조트는 시설이 좋지만 가격이 좀 높은 편이에요.",
    "에어비앤비로 현지인 집에서 머물면 진정한 여행 경험을 할 수 있어요.",
    "호텔도 괜찮지만 펜션의 감성과는 다르다고 생각해요.",
  ],
  쇼핑: [
    "제주도 특산품으로는 귤과 흑돼지가 유명합니다!",
    "면세점에서는 화장품과 명품을 저렴하게 구입할 수 있어요.",
    "동문시장은 전통시장의 분위기를 느낄 수 있는 좋은 곳입니다.",
    "흑진주나 산호 악세사리도 제주도 기념품으로 좋아요.",
    "롯데마트나 홈플러스에서 기념품을 사는 것도 좋습니다.",
  ],
  관광지: [
    "성산일출봉은 꼭 가봐야 할 곳입니다. 일출이 정말 아름다워요!",
    "중문 관광단지는 다양한 박물관과 테마파크가 있어요.",
    "오설록 티뮤지엄은 차를 좋아하는 사람에게 정말 추천합니다!",
    "만장굴은 신기한 자연 유산입니다. 동굴 투어가 정말 좋아요.",
    "한라산 국립공원은 등산객에게 최고의 명소입니다.",
  ],
};

async function generateExpertsAndAnswers() {
  console.log("🌱 시작: 50명의 전문가와 답변 생성\n");

  try {
    // 1. 카테고리 조회
    console.log("1️⃣  카테고리 조회 중...");
    const categories = await prisma.category.findMany();
    console.log(`✅ ${categories.length}개 카테고리 조회 완료\n`);

    // 2. 기존 질문 조회
    console.log("2️⃣  기존 질문 조회 중...");
    const questions = await prisma.question.findMany();
    console.log(`✅ ${questions.length}개 질문 조회 완료\n`);

    if (questions.length === 0) {
      console.log("⚠️  질문이 없습니다. 먼저 seed.ts를 실행해주세요.\n");
      return;
    }

    // 3. 전문가 사용자 생성
    console.log("3️⃣  50명의 전문가 사용자 생성 중...");
    const expertUsers = [];

    for (let i = 1; i <= 50; i++) {
      const nickname = generateKoreanNickname(i);
      const email = generateEmail(nickname);

      // 포인트: 500~5000
      const points = Math.floor(Math.random() * 4500 + 500);

      try {
        const user = await prisma.user.create({
          data: {
            email,
            name: `전문가_${i}`,
            nickname,
            provider: "email",
            providerId: null,
            bio: `${categoryNames[i % categoryNames.length]} 전문가입니다. 제주도 여행 정보를 공유하고 있습니다.`,
            location: "제주도",
            isActive: true,
            isVerified: true,
            points,
            level: Math.min(5, Math.floor(points / 1000) + 1),
            password: "hashed_password_123", // 실제로는 해시되어야 함
          },
        });

        expertUsers.push(user);

        if (i % 10 === 0) {
          console.log(`  ✓ ${i}/50 전문가 생성됨`);
        }
      } catch (error: any) {
        if (error.code === "P2002") {
          // Unique 제약 위반 - 사용자 조회
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });
          if (existingUser) {
            expertUsers.push(existingUser);
          }
        } else {
          throw error;
        }
      }
    }

    console.log(`✅ ${expertUsers.length}명의 전문가 생성 완료\n`);

    // 4. 각 전문가별 답변 생성
    console.log("4️⃣  전문가별 답변 생성 중...");
    let totalAnswersCreated = 0;
    let adoptedAnswersCount = 0;

    for (let i = 0; i < expertUsers.length; i++) {
      const expert = expertUsers[i];
      const categoryIndex = i % categoryNames.length;
      const categoryName = categoryNames[categoryIndex];

      // 질문 5~20개 무작위 선택
      const answerCount = Math.floor(Math.random() * 16 + 5);

      for (let j = 0; j < answerCount; j++) {
        // 무작위 질문 선택
        const randomQuestion =
          questions[Math.floor(Math.random() * questions.length)];

        // 샘플 답변 선택
        const templates =
          answerTemplates[categoryName as keyof typeof answerTemplates] ||
          answerTemplates["관광지"];
        const template =
          templates[Math.floor(Math.random() * templates.length)];
        const answerContent = template.replace(
          "{음식}",
          ["한식", "해산물", "고기", "카페", "디저트"][
            Math.floor(Math.random() * 5)
          ]
        );

        // 채택율: 30~80%
        const isAccepted = Math.random() < 0.5;

        try {
          await prisma.answer.create({
            data: {
              content: answerContent,
              authorId: expert.id,
              questionId: randomQuestion.id,
              status: "ACTIVE",
              isAccepted,
              likeCount: Math.floor(Math.random() * 20),
              dislikeCount: Math.floor(Math.random() * 5),
              expertPoints: isAccepted ? 100 : 50,
              acceptedAt: isAccepted ? new Date() : null,
            },
          });

          totalAnswersCreated++;

          if (isAccepted) {
            adoptedAnswersCount++;
            // 사용자 통계 업데이트
            await prisma.user.update({
              where: { id: expert.id },
              data: {
                adoptedAnswers: {
                  increment: 1,
                },
              },
            });
          }

          // 답변 수 업데이트
          await prisma.user.update({
            where: { id: expert.id },
            data: {
              totalAnswers: {
                increment: 1,
              },
            },
          });
        } catch (error) {
          // 중복 답변이나 다른 에러 무시
        }
      }

      if ((i + 1) % 10 === 0) {
        console.log(
          `  ✓ ${i + 1}/50 전문가의 답변 생성 완료 (총 ${totalAnswersCreated}개)`
        );
      }
    }

    console.log(`✅ 총 ${totalAnswersCreated}개의 답변 생성 완료`);
    console.log(`✅ 채택된 답변: ${adoptedAnswersCount}개\n`);

    // 5. 각 사용자의 채택율 계산
    console.log("5️⃣  사용자 채택율 및 통계 업데이트 중...");

    for (const expert of expertUsers) {
      const answers = await prisma.answer.findMany({
        where: { authorId: expert.id },
      });

      if (answers.length > 0) {
        const adoptedCount = answers.filter(a => a.isAccepted).length;
        const adoptRate = (adoptedCount / answers.length) * 100;

        await prisma.user.update({
          where: { id: expert.id },
          data: {
            totalAnswers: answers.length,
            adoptedAnswers: adoptedCount,
            adoptRate,
          },
        });
      }
    }

    console.log(`✅ ${expertUsers.length}명의 사용자 통계 업데이트 완료\n`);

    // 6. 배지 자동 부여
    console.log("6️⃣  배지 부여 중...");
    const badges = await prisma.badge.findMany();
    let totalBadgesAwarded = 0;

    for (const expert of expertUsers) {
      const user = await prisma.user.findUnique({
        where: { id: expert.id },
      });

      if (user) {
        for (const badge of badges) {
          let shouldAward = false;

          // 배지 조건 확인
          if (
            badge.requiredAnswers &&
            user.totalAnswers >= badge.requiredAnswers
          ) {
            shouldAward = true;
          }

          if (
            badge.requiredAdoptRate &&
            user.adoptRate >= badge.requiredAdoptRate
          ) {
            shouldAward = true;
          }

          if (shouldAward) {
            try {
              await prisma.userBadge.create({
                data: {
                  userId: expert.id,
                  badgeId: badge.id,
                  earnedAt: new Date(),
                  notified: false,
                },
              });

              totalBadgesAwarded++;
            } catch (error) {
              // 이미 획득한 배지는 스킵
            }
          }
        }
      }
    }

    console.log(`✅ 총 ${totalBadgesAwarded}개의 배지 부여 완료\n`);

    // 7. 최종 결과 출력
    console.log("================================");
    console.log("✅ 데이터 생성 완료!");
    console.log("================================\n");
    console.log("📊 생성 통계:");
    console.log(`  • 전문가 사용자: ${expertUsers.length}명`);
    console.log(`  • 생성된 답변: ${totalAnswersCreated}개`);
    console.log(`  • 채택된 답변: ${adoptedAnswersCount}개`);
    console.log(`  • 배지 부여: ${totalBadgesAwarded}개\n`);

    console.log("🎯 확인 방법:");
    console.log("  1. http://localhost:3000/experts - 전문가 대시보드 확인");
    console.log(
      "  2. curl http://localhost:4000/api/badges/experts/ranking - API 테스트\n"
    );
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    throw error;
  }
}

async function main() {
  try {
    await generateExpertsAndAnswers();
  } catch (error) {
    console.error("❌ Seed 실패:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
