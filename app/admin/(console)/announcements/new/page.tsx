import { createAnnouncement } from "@/lib/actions/announcement/announcements";
import { AnnouncementForm } from "@/components/organisms/announcement/AnnouncementForm";

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
