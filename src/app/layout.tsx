import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | VoicePrep AI",
    default: "VoicePrep AI — Real-Time AI Mock Interviews",
  },
  description:
    "Practice live voice-based interviews with an AI agent. Get instant feedback, transcripts, and actionable insights to land your dream job.",
  keywords: ["mock interview", "AI interview", "voice interview", "interview practice", "coding interview"],
  openGraph: {
    title: "VoicePrep AI — Real-Time AI Mock Interviews",
    description: "Practice live voice-based interviews with an AI agent.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(228 18% 10%)",
                color: "hsl(228 10% 90%)",
                border: "1px solid hsl(228 14% 22%)",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "hsl(158 64% 52%)",
                  secondary: "hsl(228 18% 10%)",
                },
              },
              error: {
                iconTheme: {
                  primary: "hsl(0 72% 58%)",
                  secondary: "hsl(228 18% 10%)",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
