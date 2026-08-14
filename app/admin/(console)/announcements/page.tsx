import { getAnnouncements } from "@/lib/actions/announcements";
import { AnnouncementFilterBar } from "@/components/organisms/AnnouncementFilterBar";
import { AnnouncementList } from "@/components/organisms/AnnouncementList";

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { category, sort } = await searchParams;
  const normalizedSort = sort === "asc" ? "asc" : "desc";
  const announcements = await getAnnouncements({ category, sort: normalizedSort });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        공지사항
      </h1>
      <AnnouncementFilterBar defaultCategory={category} defaultSort={normalizedSort} />
      <AnnouncementList announcements={announcements} />
    </div>
  );
}
