import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { isValidUserRole } from "@/lib/userRoles";

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: string;
}

interface SetUserRoleInput {
  uid: string;
  role: string;
}

const INTERNAL_ADMIN_ROLES = new Set(["ADMIN", "DEVELOPER", "MANAGER"]);

async function assertInternalAdmin() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Anda harus login sebagai admin internal.");
  }

  const currentUserDoc = await getDoc(doc(db, "T_USERS", currentUser.uid));
  const actorRole = String(currentUserDoc.data()?.KATEGORI || "").toUpperCase();
  if (!INTERNAL_ADMIN_ROLES.has(actorRole)) {
    throw new Error("Aksi ini hanya diizinkan untuk admin internal.");
  }
}

export const createUserByAdmin = async (payload: CreateUserInput) => {
  await assertInternalAdmin();

  const email = payload.email.trim().toLowerCase();
  const name = payload.name.trim();
  const role = payload.role.trim().toUpperCase();
  const password = payload.password;

  if (!email || !name || !password) {
    throw new Error("Nama, email, dan password wajib diisi.");
  }
  if (password.length < 6) {
    throw new Error("Password minimal 6 karakter.");
  }
  if (!isValidUserRole(role)) {
    throw new Error("Role tidak valid.");
  }

  const secondaryApp = initializeApp(
    {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    },
    `admin-create-user-${Date.now()}`
  );
  const secondaryAuth = getAuth(secondaryApp);

  let createdUid = "";
  try {
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );
    createdUid = userCredential.user.uid;

    await setDoc(doc(db, "T_USERS", createdUid), {
      UID: createdUid,
      NAMA: name,
      EMAIL: email,
      KATEGORI: role,
      ACTIVE: true,
      CREATED_AT: serverTimestamp(),
      UPDATED_AT: serverTimestamp(),
    }, { merge: true });

    return { uid: createdUid };
  } catch (error) {
    if (createdUid) {
      try {
        // Best-effort rollback to avoid orphan auth user.
        const authUser = secondaryAuth.currentUser;
        if (authUser) await deleteUser(authUser);
      } catch {
        // Ignore rollback failures and surface original error.
      }
    }
    throw error;
  } finally {
    if (secondaryAuth.currentUser) {
      await signOut(secondaryAuth).catch(() => undefined);
    }
    await deleteApp(secondaryApp).catch(() => undefined);
  }
};

export const setUserRoleByAdmin = async (payload: SetUserRoleInput) => {
  await assertInternalAdmin();

  const uid = payload.uid.trim();
  const role = payload.role.trim().toUpperCase();
  if (!uid || !isValidUserRole(role)) {
    throw new Error("UID/role tidak valid.");
  }

  await updateDoc(doc(db, "T_USERS", uid), {
    KATEGORI: role,
    UPDATED_AT: serverTimestamp(),
  });
  return { success: true };
};
