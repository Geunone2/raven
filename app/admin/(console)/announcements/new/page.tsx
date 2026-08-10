import { createAnnouncement } from "@/lib/actions/announcements";
import { AnnouncementForm } from "@/components/organisms/AnnouncementForm";

export default function NewAnnouncementPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        새 공지 작성
      </h1>
      <AnnouncementForm action={createAnnouncement} />
    </div>
  );
}
