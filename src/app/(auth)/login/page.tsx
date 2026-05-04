"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNotification } from "@/features/notification/NotificationContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthError {
  code?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg("Silakan masukkan email Anda terlebih dahulu untuk reset password.");
      return;
    }
    
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      notify("Link reset password telah dikirim ke email Anda. Silakan cek inbox/spam.", "success");
      setErrorMsg("");
    } catch (error: unknown) {
      console.error(error);
      const authError = error as AuthError;
      if (authError.code === 'auth/user-not-found') {
        setErrorMsg("Email tidak ditemukan dalam sistem.");
      } else if (authError.code === 'auth/invalid-email') {
        setErrorMsg("Format email tidak valid.");
      } else {
        setErrorMsg("Gagal mengirim email reset. Pastikan koneksi stabil.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      // Wait briefly for auth context to catch up
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error: unknown) {
      console.error(error);
      const authError = error as AuthError;
      if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        setErrorMsg("Email atau Password salah!");
      } else if (authError.code === 'auth/too-many-requests') {
        setErrorMsg("Terlalu banyak percobaan. Coba lagi nanti.");
      } else {
        setErrorMsg("Gagal masuk. Silakan periksa koneksi Anda.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/30 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md animate-slide-up z-10">
        <div className="glass rounded-2xl p-8 border border-border/50 shadow-2xl relative overflow-hidden">
          {/* Accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image src="/logo.png" alt="Prepress Platinum Logo" width={180} height={80} className="h-20 w-auto object-contain drop-shadow-sm" />
            </div>
            <p className="text-muted-foreground text-sm">Masuk ke akun Anda</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold text-center animate-fade-in shadow-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10 pr-4"
                  placeholder="operator@prepress.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">Ingat saya</span>
              </label>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Lupa password?
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Sedang masuk..." : (
                <>Masuk <ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Akun dibuat oleh admin internal. Hubungi administrator untuk akses.
          </p>
        </div>
      </div>
    </div>
  );
}
