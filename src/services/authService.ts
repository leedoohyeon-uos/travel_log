import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  AuthError
} from "firebase/auth";
import { auth } from "../firebase-config";
import { ensureUserProfile } from "./adminService";

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signUpUser(email: string, pass: string): Promise<User> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await ensureUserProfile(credential.user.uid, email.trim(), pass);
    return credential.user;
  } catch (error) {
    const err = error as AuthError;
    throw new Error(getKoreanAuthErrorMessage(err.code));
  }
}

export async function signInUser(email: string, pass: string): Promise<User> {
  const trimmedEmail = email.trim();
  try {
    const credential = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
    await ensureUserProfile(credential.user.uid, trimmedEmail, pass);
    return credential.user;
  } catch (error) {
    const err = error as AuthError;
    throw new Error(getKoreanAuthErrorMessage(err.code));
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error("로그아웃 중 오류가 발생했습니다.");
  }
}

function getKoreanAuthErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "이미 가입되어 있는 이메일 주소입니다.";
    case "auth/invalid-email":
      return "올바른 이메일 형식이 아닙니다.";
    case "auth/operation-not-allowed":
      return "이메일/비밀번호 로그인 방식이 비활성화되어 있습니다.";
    case "auth/weak-password":
      return "비밀번호는 최소 6자 이상이어야 합니다.";
    case "auth/user-disabled":
      return "이 계정은 비활성화되었습니다.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "auth/too-many-requests":
      return "시도 횟수가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    case "auth/network-request-failed":
      return "네트워크 연결 상태를 확인해 주세요.";
    default:
      return "인증 처리 중 오류가 발생했습니다. (" + code + ")";
  }
}
