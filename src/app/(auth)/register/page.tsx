"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, Users, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ROLE_SELECT_GROUPS, isValidUserRole } from "@/lib/userRoles";

interface AuthError {
  code?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("MANAGER");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (!isValidUserRole(role)) {
        throw new Error("Role user tidak valid.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a user document in Firestore to store their role and name
      await setDoc(doc(db, "T_USERS", user.uid), {
        NAMA: name,
        EMAIL: email,
        KATEGORI: role,
        UID: user.uid,
        ACTIVE: true,
        UPDATED_AT: Date.now(),
        CREATED_AT: new Date().toISOString()
      });

      // Redirect to dashboard after successful registration
      setTimeout(() => {
        router.push("/");
      }, 500);
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
            <p className="text-muted-foreground text-sm">Join the Prepress Platinum System</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold text-center animate-fade-in shadow-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full h-11 bg-background border border-border rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  placeholder="John Doe"
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
                  placeholder="work@prepress.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium ml-1">Department Role</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full h-11 bg-background border border-border rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none"
                >
                  {ROLE_SELECT_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((roleOption) => (
                        <option key={roleOption} value={roleOption}>
                          {roleOption}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {isLoading ? "Signing up..." : (
                <>Sign Up <ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
