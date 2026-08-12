import React, { useState } from 'react';
import { signUpUser, signInUser } from '../services/authService';
import { X, Mail, Lock, LogIn, UserPlus, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTestGuestSession?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onStartTestGuestSession
}) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (isSignUp) {
      if (password.length < 6) {
        setErrorMessage("비밀번호는 최소 6자 이상이어야 합니다.");
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMessage("비밀번호 확인이 일치하지 않습니다.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpUser(email, password);
        setSuccessMessage("회원가입이 완료되었습니다! 반갑습니다.");
      } else {
        await signInUser(email, password);
        setSuccessMessage("성공적으로 로그인되었습니다.");
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "인증 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestGuestLogin = () => {
    if (onStartTestGuestSession) {
      onStartTestGuestSession();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E2D9] bg-[#F9F8F6] flex items-center justify-between">
          <h3 className="font-serif italic font-bold text-lg text-[#3A3A3A] flex items-center gap-2">
            {isSignUp ? <UserPlus className="w-5 h-5 text-[#4B5E40]" /> : <LogIn className="w-5 h-5 text-[#4B5E40]" />}
            {isSignUp ? "Travel Log 회원가입" : "Travel Log 로그인"}
          </h3>
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guest Test Button Banner */}
        <div className="p-5 pb-0">
          <button
            id="btn-test-account-login"
            type="button"
            onClick={handleTestGuestLogin}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#4B5E40] to-[#36472D] hover:from-[#3d4d34] hover:to-[#283620] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold">🧪 테스트용 계정으로 접속</span>
              <span className="text-[10px] text-gray-200 font-normal">
                1234@gmail.com 계정으로 기능 체험 (종료 시 시작 전 상태로 원상복구)
              </span>
            </div>
          </button>
        </div>

        <div className="relative my-4 px-6 flex items-center">
          <div className="flex-grow border-t border-[#E5E2D9]"></div>
          <span className="flex-shrink mx-3 text-[11px] text-gray-400 font-medium">또는 이메일 로그인</span>
          <div className="flex-grow border-t border-[#E5E2D9]"></div>
        </div>

        {/* Alerts */}
        <div className="px-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#F0EFEC] border border-[#E5E2D9] text-[#4B5E40] text-xs rounded-xl flex items-center gap-2 mb-3 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#4B5E40] shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">이메일 주소</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                id="input-auth-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#F5F5F0] text-[#1A1A1A] text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E2D9] focus:outline-none focus:ring-2 focus:ring-[#4B5E40]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                id="input-auth-password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="최소 6자 이상 입력"
                className="w-full bg-[#F5F5F0] text-[#1A1A1A] text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E2D9] focus:outline-none focus:ring-2 focus:ring-[#4B5E40]"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">비밀번호 확인</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  id="input-auth-password-confirm"
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 다시 입력"
                  className="w-full bg-[#F5F5F0] text-[#1A1A1A] text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E2D9] focus:outline-none focus:ring-2 focus:ring-[#4B5E40]"
                />
              </div>
            </div>
          )}

          <button
            id="btn-submit-auth"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#4B5E40] hover:bg-[#3d4d34] text-white font-bold rounded-xl text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "처리 중..." : isSignUp ? "회원가입 완료" : "로그인하기"}
          </button>

          <div className="pt-2 text-center text-xs text-gray-500">
            {isSignUp ? (
              <span>
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage(null);
                  }}
                  className="text-[#4B5E40] font-bold hover:underline"
                >
                  로그인하기
                </button>
              </span>
            ) : (
              <span>
                아직 계정이 없으신가요?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage(null);
                  }}
                  className="text-[#4B5E40] font-bold hover:underline"
                >
                  회원가입하기
                </button>
              </span>
            )}
          </div>
        </form>

      </div>
    </div>
  );
};
