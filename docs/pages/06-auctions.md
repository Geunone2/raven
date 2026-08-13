# 경매(내판) 참여 (`/auctions`)

> ✅ **완료로 확정됨(2026-08-13).** 한동안 "나중에 더 자세히 스펙을 주겠다"며 보류했던 항목이지만, 아래 최소 스펙 그대로 완료 상태로 확정했습니다. [00-roadmap.md](./00-roadmap.md) 참고.

로그인 필수(`redirect("/login")`).

## 목적/기능

전리품(`loots`) 중 `distribution_method = 'auction'`인 항목의 전체 목록을 검색/필터링하며 입찰하는 페이지.

- **낙찰 규칙**: 마감 시 입찰자 중 전투력(공격력+방어력+명중 합)이 가장 높은 사람이 자동으로 낙찰자로 확정됩니다. 운영진이 필요 시 관리자 화면에서 낙찰 결과를 수동으로 override할 수 있습니다(`loots.receiver` 필드, 관리자 콘솔 쪽 기능이라 이 문서 범위 밖).
- 홈 대시보드의 `AuctionCard`(캐러셀, 상위 5개, 마감된 것 제외)와 달리, 이 페이지는 마감된 경매를 포함한 **전체 목록**을 보여주고 필터/검색이 가능합니다.

## 파일 구성

```
app/(user)/auctions/page.tsx
├── lib/actions/loots.ts                getAuctionLoots(), getBidsForLoot(), getMyBidAmounts()
├── lib/actions/members.ts              getMember()
├── lib/auth/session.ts                 getSessionMemberId()
└── components/organisms/AuctionFilterPanel.tsx   ("use client")
    ├── lib/constants/loots.ts          isAuctionEnded()
    ├── lib/constants/members.ts        GUILD_NAMES
    ├── lib/colorHash.ts                hashTone()
    ├── components/atoms/Button.tsx, Badge.tsx
    └── components/organisms/AuctionList.tsx        전체 목록 렌더링
        ├── components/atoms/TimerIcon.tsx
        ├── components/atoms/LootBidCountdown.tsx
        └── components/atoms/AuctionBidButtons.tsx
            ├── lib/actions/loots.ts    placeBid(), cancelBid()
            ├── lib/hooks/useClickDebounce.ts
            └── components/atoms/ToastProvider.tsx
```

`components/organisms/AuctionBidList.tsx`(`awardAuction` 액션 사용)는 관리자 콘솔(`/admin/loots`)에서 낙찰자를 수동 지정할 때 쓰는 컴포넌트로, 이 페이지에서는 사용하지 않습니다.
