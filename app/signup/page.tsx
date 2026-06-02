"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace("/");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <main className='flex flex-col min-h-screen items-center justify-center'>
        <div className='w-8 h-8 rounded-full border-2 border-[#ff2d2d] border-t-transparent animate-spin' />
      </main>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className='flex flex-col min-h-screen items-center justify-center px-6'>
      <div className='text-center mb-6'>
        <h1 className='text-4xl font-black tracking-tight leading-none mb-2'>
          <span className='text-[#f5f5dc]'>FLSH</span>
          <span className='neon-red'>BK</span>
        </h1>
        <p className='text-xs text-[#f0ede6]/40 font-mono'>
          Join the collector community
        </p>
      </div>

      <div className='w-full max-w-sm'>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-[rgba(14,14,18,0.96)] border border-[rgba(245,245,220,0.1)] shadow-none",
              headerTitle: "text-[#f5f5dc]",
              headerSubtitle: "text-[#f0ede6]/50",
              socialButtonsBlockButton:
                "border border-[rgba(245,245,220,0.1)] text-[#f5f5dc] hover:bg-[rgba(245,245,220,0.05)]",
              formFieldInput:
                "bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-[#f5f5dc] placeholder-[#f0ede6]/30 focus:border-[rgba(255,45,45,0.4)]",
              formButtonPrimary:
                "bg-gradient-to-r from-[#ff2d2d] to-[#cc0000] text-white hover:opacity-90",
              footerActionLink: "text-[#ff2d2d] hover:text-[#ff2d2d]",
              dividerLine: "bg-[rgba(245,245,220,0.1)]",
              dividerText: "text-[#f0ede6]/30",
              formFieldLabel: "text-[#f0ede6]/50",
            },
          }}
          routing='path'
          path='/signup'
          signInUrl='/login'
        />
      </div>

      <Link href='/'>
        <p className='text-center text-[#f0ede6]/20 text-[10px] font-mono mt-6 hover:text-[#f0ede6]/40 transition-colors'>
          Continue as guest →
        </p>
      </Link>
    </main>
  );
}
