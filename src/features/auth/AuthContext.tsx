"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNotification } from "@/features/notification/NotificationContext";

interface AuthContextType {
  user: User | null;
  role: string | null;
  name: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  name: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        
        if (currentUser) {
          try {
            const userDocInfo = await getDoc(doc(db, "T_USERS", currentUser.uid));
            if (isMounted) {
              if (userDocInfo.exists()) {
                const data = userDocInfo.data();
                setRole(data.KATEGORI);
                setName(data.NAMA || data.displayName || null);
              } else {
                setRole("GUEST");
                setName(currentUser.displayName || null);
              }
            }
          } catch (error) {
            console.error("Error fetching user role", error);
            if (isMounted) {
              notify("Gagal mengambil data role pengguna", "error");
              setRole("GUEST");
            }
          }
        } else {
          if (isMounted) {
            setRole(null);
            setName(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [notify]);

  return (
    <AuthContext.Provider value={{ user, role, name, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
