"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, User, ArrowRight, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthError {
  code?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "T_USERS", user.uid), {
        NAMA: name,
        EMAIL: email,
        KATEGORI: "UMUM",
        UID: user.uid,
        ACTIVE: false,
        VALIDATED: false,
        UPDATED_AT: Date.now(),
        CREATED_AT: new Date().toISOString()
      });

      setSuccess(true);
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const authError = error as AuthError;
      if (authError.code === 'auth/email-already-in-use') {
        setErrorMsg("Email sudah terdaftar. Silakan login.");
      } else if (authError.code === 'auth/weak-password') {
        setErrorMsg("Password terlalu lemah (minimal 6 karakter).");
      } else {
        setErrorMsg("Gagal melakukan registrasi. Silakan coba lagi.");
      }
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-background via-background to-primary/20 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        
        <div className="w-full max-w-md animate-slide-up z-10">
          <div className="glass rounded-2xl p-8 border border-border/50 shadow-2xl relative overflow-hidden text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Registrasi Berhasil!</h2>
            <p className="text-muted-foreground mb-6">
              Akun Anda telah dibuat. Silakan tunggu validasi dari administrator untuk dapat mengakses sistem.
            </p>
            <Link href="/login" className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              Ke Halaman Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-background via-background to-primary/20 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md animate-slide-up z-10">
        <div className="glass rounded-2xl p-8 border border-border/50 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image src="/logo.png" alt="Prepress Platinum Logo" width={160} height={64} className="h-16 w-auto object-contain drop-shadow-sm" />
            </div>
            <p className="text-muted-foreground text-sm">Daftar Akun Prepress Platinum</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold text-center animate-fade-in shadow-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium ml-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full h-11 bg-background border border-border rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  placeholder="Nama Lengkap Anda"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full h-11 bg-background border border-border rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  placeholder="email@perusahaan.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full h-11 bg-background border border-border rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-amber-50 p-3 rounded-xl border border-amber-200">
              <p className="font-semibold text-amber-700 mb-1">Catatan:</p>
              <p>Setelah mendaftar, akun Anda akan menunggu validasi dari administrator sebelum dapat digunakan.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {isLoading ? "Mendaftarkan..." : (
                <>Daftar <ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
