# Answer Adoption API Documentation

## Overview

The Answer Adoption System enables question authors to mark answers as helpful and automatically reward answerers with points and badges.

## Endpoints

### POST /api/answers/:answerId/adopt

**Purpose**: Mark an answer as adopted (helpful)

**Request Body**:

```json
{
  "questionId": "string (CUID)"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "answer": {
    "id": "string",
    "content": "string",
    "isAccepted": true,
    "adoptedAt": "ISO8601 timestamp",
    "authorId": "string",
    "likeCount": number,
    "dislikeCount": number
  },
  "pointsAwarded": 50,
  "newBalance": number,
  "badgesAwarded": ["badge_id_1", "badge_id_2"]
}
```

**Error Cases**:

- 401: User not authenticated
- 403: Only question author can adopt answers
- 404: Answer or question not found
- 400: Invalid request data

### DELETE /api/answers/:answerId/adopt

**Purpose**: Unadopt (remove adoption) of an answer

**Request Body**:

```json
{
  "questionId": "string"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "answer": {
    "id": "string",
    "isAccepted": false,
    "adoptedAt": null
  },
  "message": "Answer adoption removed (points NOT refunded per SPEC)"
}
```

## Point System

### Automatic Point Distribution

- **Base Points**: 50 points per adoption
- **Badge Bonus**: +25 points (if "10회 채택 전문가" badge awarded)
- **Total**: 50-75 points per adoption
- **Audit Trail**: All transactions recorded in PointTransaction table

### Point Distribution Guarantees

- ✅ Atomic transaction (all-or-nothing)
- ✅ No duplicate points (idempotent)
- ✅ Points NOT refunded on unadoption
- ✅ Full audit trail maintained

## Badge System Integration

### Auto-Award Criteria

1. **"첫 번째 채택"** - Awarded on 1st adoption
2. **"10회 채택 전문가"** - Awarded on 10th adoption
3. **"베스트 앤서"** - Awarded when:
   - Answer has 50+ likes
   - AND answer is adopted

### Badge Award Flow

1. Answer adoption triggered
2. Point distribution completes
3. BadgeService.checkAndAwardBadges() called asynchronously
4. Badge awarded (if criteria met)
5. User notified via Socket.io

## Real-time Notifications

### Socket.io Events

- **event**: "answer:adopted"
- **data**: { answerId, questionId, adopterId, pointsAwarded }
- **recipient**: Answer author (real-time notification)

## Example Usage

### Adopt an Answer

```bash
curl -X POST http://localhost:3000/api/answers/abc123/adopt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"questionId": "q789"}'

# Response:
# {
#   "success": true,
#   "pointsAwarded": 50,
#   "newBalance": 1050
# }
```

### Unadopt an Answer

```bash
curl -X DELETE http://localhost:3000/api/answers/abc123/adopt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"questionId": "q789"}'
```

## Implementation Details

### Transaction Safety

All adoption operations use Prisma $transaction() to ensure atomicity:

1. Update Answer.isAccepted = true/false
2. Update/Create PointTransaction
3. Update User.points
4. Update User adoption statistics (adoptedAnswers count)

### Error Handling

- Transaction rollback on any error
- User receives clear error messages
- No partial updates (all-or-nothing)

### Performance Considerations

- Index on Answer.questionId, Answer.authorId
- Async badge award (non-blocking)
- Socket.io notification (non-blocking)
- Query optimization for adoption counts

## Related Services

- **AnswerAdoptionService**: Core adoption logic
- **PointService**: Point distribution system
- **BadgeService**: Badge award criteria
- **NotificationManager**: Real-time notifications

## Traceability

### Related SPEC

- @SPEC:ANSWER-INTERACTION-001: 답변 상호작용 기능 개선

### Related Requirements

- @REQ:ANSWER-INTERACTION-001-U1: Multiple adoption support
- @REQ:ANSWER-INTERACTION-001-U3: Point distribution
- @REQ:ANSWER-INTERACTION-001-E1: Adoption event
- @REQ:ANSWER-INTERACTION-001-E3: Badge award integration

### Related Code

- @CODE:apps/api/src/routes/answer\*.ts
- @CODE:apps/api/src/services/answer-adoption.service.ts
- @CODE:packages/database/src/services/point/PointService.ts
