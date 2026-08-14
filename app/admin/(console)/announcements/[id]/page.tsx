import { notFound } from "next/navigation";
import { getAnnouncement, updateAnnouncement } from "@/lib/actions/announcement/announcements";
import { AnnouncementForm } from "@/components/organisms/announcement/AnnouncementForm";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await getAnnouncement(Number(id));

  if (!announcement) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        공지 수정
      </h1>
      <AnnouncementForm
        announcement={announcement}
        action={updateAnnouncement.bind(null, announcement.id)}
      />
    </div>
  );
}
