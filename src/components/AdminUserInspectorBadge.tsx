import React from 'react';
import { UserAccountRegistryDoc } from '../services/adminService';
import { ShieldCheck, Lock, Mail, EyeOff } from 'lucide-react';

interface AdminUserInspectorBadgeProps {
  selectedUser: UserAccountRegistryDoc | null;
}

export const AdminUserInspectorBadge: React.FC<AdminUserInspectorBadgeProps> = ({ selectedUser }) => {
  if (!selectedUser) return null;

  return (
    <div
      id="admin-user-inspector-badge"
      className="fixed top-16 right-3 sm:top-20 sm:right-6 z-40 bg-white/95 backdrop-blur-md border-2 border-amber-500/80 p-3 sm:p-4 rounded-2xl shadow-xl text-xs text-[#1A1A1A] w-72 sm:w-80 animate-fade-in transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-amber-200">
        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs sm:text-sm">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>관리자: 사용자 계정 조회</span>
        </div>
        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
          Read-only
        </span>
      </div>

      {/* Account Info */}
      <div className="mt-2.5 space-y-2">
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
          <span className="text-gray-500 font-medium text-[11px] flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-gray-400" /> 아이디
          </span>
          <span className="font-bold text-[#1A1A1A] font-mono text-xs select-all">
            {selectedUser.email}
          </span>
        </div>

        <div className="flex items-center justify-between bg-red-50/80 p-2 rounded-xl border border-red-200">
          <span className="text-red-700 font-medium text-[11px] flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-red-500" /> 비밀번호
          </span>
          <span className="font-bold text-red-600 font-mono text-xs bg-white px-2 py-0.5 rounded border border-red-300 shadow-2xs select-all">
            {selectedUser.password || '123456'}
          </span>
        </div>
      </div>

      {/* Restriction Warning */}
      <div className="mt-2.5 pt-2 border-t border-amber-100 text-[11px] text-amber-800 flex items-start gap-1.5 leading-tight">
        <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <span>
          관리자 모드에서는 해당 사용자의 데이터를 <strong>조회만 가능</strong>하며, 계정 정보 및 기록 수정이 금지됩니다.
        </span>
      </div>
    </div>
  );
};
