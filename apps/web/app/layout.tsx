
import type { Metadata } from "next";
import { Geist_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vynor.in"),

  title: {
    default: "Vynor – Digital Engineering Workspace for Software Teams",
    template: "%s | Vynor",
  },

  description:
    "Vynor brings project management, team chat, meetings, documentation, tasks, files, and AI-powered collaboration together in one digital engineering workspace.",

  applicationName: "Vynor",

  keywords: [
    "Vynor",
    "digital engineering workspace",
    "project management software",
    "team collaboration",
    "software development workspace",
    "team communication",
    "project collaboration",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "https://vynor.in",
    siteName: "Vynor",
    title: "Vynor – Your Digital Engineering Workspace",
    description:
      "Plan projects, collaborate with your team, manage tasks, hold meetings, and organize documentation in one workspace.",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Vynor – Your Digital Engineering Workspace",
    description:
      "Everything your software team needs to plan, communicate, and build together.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${interTight.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
