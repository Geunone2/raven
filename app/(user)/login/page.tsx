import Link from "next/link";
import { login } from "@/lib/actions/auth";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-edge bg-surface-raised/60 p-10">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              로그인
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              가입 신청 시 설정한 닉네임과 비밀번호로 로그인하세요.
            </p>
            {error && (
              <p className="mt-2 text-sm text-danger">
                닉네임 또는 비밀번호가 올바르지 않습니다.
              </p>
            )}
          </div>
          <form action={login} className="space-y-4">
            <FormField label="닉네임" htmlFor="nickname">
              <Input id="nickname" name="nickname" required />
            </FormField>
            <FormField label="비밀번호" htmlFor="password">
              <Input id="password" name="password" type="password" required />
            </FormField>
            <div className="flex justify-end pt-2">
              <Button type="submit">로그인</Button>
            </div>
          </form>
          <p className="text-center text-sm text-ink-muted">
            아직 회원이 아니신가요?{" "}
            <Link href="/signup" className="text-brand hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
