import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillBridge AI — MVP Demo",
  description: "AI skills assessment, training roadmap, and employer matching — MVP demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-bold text-navy text-lg">
              SkillBridge AI <span className="text-xs font-normal text-gray-400">MVP demo</span>
            </Link>
            <nav className="flex gap-4 text-sm font-medium">
              <Link href="/student" className="text-navy hover:text-teal">Student</Link>
              <Link href="/university" className="text-navy hover:text-teal">University</Link>
              <Link href="/employer" className="text-navy hover:text-teal">Employer</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-gray-400">
          Demo data only — assessment is illustrative, not a validated psychometric instrument.
        </footer>
      </body>
    </html>
  );
}
