import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { GlobalQuickAdd } from "@/components/GlobalQuickAdd";
import { AIAssistantBubble } from "@/components/AIAssistantBubble";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MeetingProvider } from "@/features/meeting-transcriber";

const geistSans = Geist({
 variable: "--font-geist-sans",
 subsets: ["latin"],
});

const geistMono = Geist_Mono({
 variable: "--font-geist-mono",
 subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "LifeOS",
 description: "AI-powered Personal Operating System",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html
 lang="en"
 className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
 suppressHydrationWarning
 >
 <body suppressHydrationWarning className="min-h-full flex flex-col relative bg-background text-foreground overflow-hidden">
 <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
 <MeetingProvider>
 <div className="flex h-screen w-full overflow-hidden z-10 relative">
 <Sidebar />
 <main className="flex-1 overflow-auto">
 {children}
 </main>
 </div>
 <CommandPalette />
 <GlobalQuickAdd />
 <AIAssistantBubble />
 </MeetingProvider>
 </ThemeProvider>
 </body>
 </html>
 );
}
