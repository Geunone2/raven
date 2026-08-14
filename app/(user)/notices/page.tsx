import { getNoticesPage } from "@/lib/actions/announcement/notices";
import { NoticeFeed } from "@/components/organisms/community/NoticeFeed";

export default async function NoticesPage() {
  const { items, hasMore } = await getNoticesPage({ category: "all", query: "", page: 1 });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">공지사항</h1>
      <NoticeFeed initialItems={items} initialHasMore={hasMore} />
    </div>
  );
}
