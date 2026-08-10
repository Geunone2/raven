import { redirect } from "next/navigation";
import { adminLogin } from "@/lib/actions/adminAuth";
import { isAdminAuthenticated } from "@/lib/auth/adminSession";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const { error } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-24">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            운영진 로그인
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            관리자 이메일과 비밀번호를 입력하세요.
          </p>
          {error && (
            <p className="mt-2 text-sm text-danger">
              이메일 또는 비밀번호가 올바르지 않습니다.
            </p>
          )}
        </div>
        <form action={adminLogin} className="space-y-4">
          <FormField label="이메일" htmlFor="email">
            <Input id="email" name="email" type="email" required />
          </FormField>
          <FormField label="비밀번호" htmlFor="password">
            <Input id="password" name="password" type="password" required />
          </FormField>
          <div className="flex justify-end pt-2">
            <Button type="submit">로그인</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
