import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/contexts/AuthContext";
import CategoryNav from "@/components/CategoryNav";
import DevAuthButton from "@/components/DevAuthButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FLSHBK — Collector's Trading Portal",
  description:
    "Verified trade platform for Pop Mart, vintage LEGO, and rare collectibles. Digital shelf, rarity tracker, and live market prices.",
  applicationName: "FLSHBK",
  keywords: [
    "trading",
    "collectibles",
    "Labubu",
    "Molly",
    "LEGO",
    "Pop Mart",
    "NFT",
    "Hong Kong",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

function isClerkConfigured(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  return !!(
    publishableKey &&
    secretKey &&
    !publishableKey.includes("placeholder") &&
    !secretKey.includes("placeholder") &&
    publishableKey.startsWith("pk_") &&
    secretKey.startsWith("sk_")
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DevAuthButton />
      <CategoryNav />
      <div className='flex flex-col min-h-screen'>{children}</div>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkConfigured = isClerkConfigured();

  if (!clerkConfigured) {
    return (
      <html
        lang='en'
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className='min-h-full flex flex-col bg-[#0d0d0f] text-[#f0ede6]'>
          <AuthProvider>
            <AppContent>{children}</AppContent>
          </AuthProvider>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html
        lang='en'
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className='min-h-full flex flex-col bg-[#0d0d0f] text-[#f0ede6]'>
          <AuthProvider>
            <AppContent>{children}</AppContent>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
