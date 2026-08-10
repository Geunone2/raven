function DiscordIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden="true">
            <path
                d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
        </svg>
    );
}

function KakaoTalkIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden="true">
            <path
                d="M12 3C6.4771 3 2 6.4844 2 10.7778c0 2.7907 1.8557 5.2408 4.6461 6.6234-.1541.5236-.9924 3.4009-1.0257 3.6224 0 0-.0197.1691.0885.2334.1082.0643.2359.0166.2359.0166.3113-.0432 3.6-2.3743 4.1811-2.7614.6119.088 1.2429.1358 1.8752.1358 5.5229 0 10-3.4844 10-7.7778S17.5229 3 12 3z"/>
        </svg>
    );
}

export function CommunityCard() {
    return (
        <div className="w-full rounded-xl border border-edge bg-surface p-4 shadow-md min-h-79">
            <p className="text-base font-bold text-brand">커뮤니티</p>
            <div className="mt-6 space-y-6 flex flex-col justify-center">
                <a
                    href="https://discord.com/invite/MDWFSUfG2q"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full min-h-14 items-center justify-center gap-2 rounded-md bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                    <DiscordIcon/>
                    디스코드 채널 참여
                </a>
                <a
                    href="https://open.kakao.com/o/giPIsTzi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full min-h-14 items-center justify-center gap-2 rounded-md bg-[#FEE500] px-4 py-2 text-sm font-semibold text-[#191919] transition-opacity hover:opacity-90"
                >
                    <KakaoTalkIcon/>
                    카카오톡 수다 채널
                </a>
                <a
                    href="https://open.kakao.com/o/giVjz1wi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full min-h-14 items-center justify-center gap-2 rounded-md bg-[#FEE500] px-4 py-2 text-sm font-semibold text-[#191919] transition-opacity hover:opacity-90"
                >
                    <KakaoTalkIcon/>
                    카카오톡 공지 채널
                </a>
            </div>
        </div>
    );
}
