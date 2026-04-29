import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

admin.initializeApp();
setGlobalOptions({ region: "asia-southeast1", maxInstances: 10 });

const ADMIN_ROLES = new Set(["ADMIN", "DEVELOPER", "MANAGER"]);
const USER_ROLES = new Set([
  "ADMIN",
  "DEVELOPER",
  "MANAGER",
  "ADMIN DT",
  "ADMIN DG",
  "ADMIN PREPRESS",
  "SPV DT",
  "DT",
  "CAD",
  "SPV DG",
  "DG",
  "DS",
  "SPV PREPRESS",
  "KOORDINATOR",
  "PRODUCTION",
  "OP CTP",
  "OP CTCP",
  "OP FLEXO",
  "OP SCREEN",
  "OP ETCHING",
  "QC",
  "SUPPORT DESIGN",
  "GMG",
  "CNC",
  "BLUEPRINT",
]);

async function getActorRole(uid: string): Promise<string> {
  const snap = await admin.firestore().collection("T_USERS").doc(uid).get();
  if (!snap.exists) return "GUEST";
  return String(snap.data()?.KATEGORI || "GUEST").toUpperCase();
}

async function assertAdminActor(authUid?: string): Promise<string> {
  if (!authUid) {
    throw new HttpsError("unauthenticated", "Anda harus login.");
  }
  const actorRole = await getActorRole(authUid);
  if (!ADMIN_ROLES.has(actorRole)) {
    throw new HttpsError("permission-denied", "Hanya admin internal yang diizinkan.");
  }
  return actorRole;
}

export const createUserByAdmin = onCall(async (request) => {
  await assertAdminActor(request.auth?.uid);

  const email = String(request.data?.email || "").trim().toLowerCase();
  const password = String(request.data?.password || "");
  const name = String(request.data?.name || "").trim();
  const role = String(request.data?.role || "").trim().toUpperCase();

  if (!email || !password || !name) {
    throw new HttpsError("invalid-argument", "Nama, email, dan password wajib diisi.");
  }
  if (password.length < 6) {
    throw new HttpsError("invalid-argument", "Password minimal 6 karakter.");
  }
  if (!USER_ROLES.has(role)) {
    throw new HttpsError("invalid-argument", "Role tidak valid.");
  }

  let createdUid = "";
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
      disabled: false,
    });
    createdUid = userRecord.uid;

    await admin.auth().setCustomUserClaims(createdUid, { role });
    await admin.firestore().collection("T_USERS").doc(createdUid).set({
      UID: createdUid,
      NAMA: name,
      EMAIL: email,
      KATEGORI: role,
      ACTIVE: true,
      CREATED_AT: admin.firestore.FieldValue.serverTimestamp(),
      UPDATED_AT: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { uid: createdUid };
  } catch (error) {
    if (createdUid) {
      await admin.auth().deleteUser(createdUid).catch(() => undefined);
    }
    throw new HttpsError("internal", (error as Error).message || "Gagal membuat user.");
  }
});

export const setUserRoleByAdmin = onCall(async (request) => {
  await assertAdminActor(request.auth?.uid);

  const uid = String(request.data?.uid || "").trim();
  const role = String(request.data?.role || "").trim().toUpperCase();
  if (!uid || !USER_ROLES.has(role)) {
    throw new HttpsError("invalid-argument", "UID/role tidak valid.");
  }

  await admin.auth().setCustomUserClaims(uid, { role });
  await admin.firestore().collection("T_USERS").doc(uid).set({
    KATEGORI: role,
    UPDATED_AT: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return { success: true };
});
