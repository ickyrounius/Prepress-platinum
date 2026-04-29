import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

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

export const createUserByAdmin = async (payload: CreateUserInput) => {
  const callable = httpsCallable<CreateUserInput, { uid: string }>(functions, "createUserByAdmin");
  const result = await callable(payload);
  return result.data;
};

export const setUserRoleByAdmin = async (payload: SetUserRoleInput) => {
  const callable = httpsCallable<SetUserRoleInput, { success: boolean }>(functions, "setUserRoleByAdmin");
  const result = await callable(payload);
  return result.data;
};
