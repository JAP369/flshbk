"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    router.replace("/");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isSignUp) {
      if (!username.trim() || !displayName.trim()) {
        setError("Username and display name are required");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, username, displayName);
      if (error) {
        setError(error);
        setLoading(false);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setLoading(false);
      }
    }
  }

  return (
    <main className='flex flex-col min-h-screen items-center justify-center px-6'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='w-full max-w-sm'
      >
        {/* Logo */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-black tracking-tight leading-none mb-2'>
            <span className='text-[#f5f5dc]'>FLSH</span>
            <span className='neon-red'>BK</span>
          </h1>
          <p className='text-xs text-[#f0ede6]/40 font-mono'>
            {isSignUp
              ? "Join the collector community"
              : "Welcome back, collector"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
          {isSignUp && (
            <>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <input
                  type='text'
                  placeholder='Username'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <input
                  type='text'
                  placeholder='Display Name'
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
                />
              </motion.div>
            </>
          )}

          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-4 py-3 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors'
          />

          <div className='relative'>
            <input
              type={showPassword ? "text" : "password"}
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className='w-full px-4 py-3 rounded-xl bg-[rgba(245,245,220,0.05)] border border-[rgba(245,245,220,0.1)] text-sm text-[#f5f5dc] placeholder-[#f0ede6]/30 outline-none focus:border-[rgba(255,45,45,0.4)] transition-colors pr-12'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-[#f0ede6]/30 hover:text-[#f0ede6]/60'
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-xs text-red-400 font-mono px-1'
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type='submit'
            disabled={loading}
            className='w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 mt-2 disabled:opacity-50'
            style={{
              background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
              boxShadow: "0 0 20px rgba(255,45,45,0.3)",
            }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className='w-4 h-4 rounded-full border-2 border-white border-t-transparent'
              />
            ) : (
              <>
                {isSignUp ? "Create Account" : "Sign In"}{" "}
                <ArrowRight size={14} />
              </>
            )}
          </motion.button>
        </form>

        {/* Toggle */}
        <p className='text-center text-xs text-[#f0ede6]/40 mt-6'>
          {isSignUp ? "Already have an account?" : "New to FLSHBK?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className='text-[#ff2d2d] font-bold hover:underline'
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </button>
        </p>

        {/* Skip for now */}
        <Link href='/'>
          <p className='text-center text-[#f0ede6]/20 text-[10px] font-mono mt-4 hover:text-[#f0ede6]/40 transition-colors'>
            Continue as guest →
          </p>
        </Link>
      </motion.div>
    </main>
  );
}
