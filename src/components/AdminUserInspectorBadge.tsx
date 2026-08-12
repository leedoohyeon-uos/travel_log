import React, { useState, useRef, useEffect } from 'react';
import { UserProfileDoc } from '../services/adminService';
import { ShieldCheck, Lock, Mail, EyeOff, Copy, Check, X, GripHorizontal, Key } from 'lucide-react';

interface AdminUserInspectorBadgeProps {
  selectedUser: UserProfileDoc | null;
  onClose?: () => void;
}

export const AdminUserInspectorBadge: React.FC<AdminUserInspectorBadgeProps> = ({
  selectedUser,
  onClose
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 20,
    posY: 80
  });

  const badgeRef = useRef<HTMLDivElement>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    // Initial right-top corner positioning if screen permits
    if (typeof window !== 'undefined') {
      const initialX = Math.max(10, window.innerWidth - 340);
      setPosition({ x: initialX, y: 80 });
    }
  }, []);

  if (!selectedUser) return null;

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on left click
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      let newX = dragStartRef.current.posX + dx;
      let newY = dragStartRef.current.posY + dy;

      // Constrain position within viewport boundaries
      const badgeWidth = badgeRef.current?.offsetWidth || 320;
      const badgeHeight = badgeRef.current?.offsetHeight || 220;

      const minX = 0;
      const maxX = Math.max(0, window.innerWidth - badgeWidth);
      const minY = 0;
      const maxY = Math.max(0, window.innerHeight - badgeHeight);

      newX = Math.min(Math.max(minX, newX), maxX);
      newY = Math.min(Math.max(minY, newY), maxY);

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleCopy = (text: string, fieldName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <div
      ref={badgeRef}
      id="admin-user-inspector-badge"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      className={`fixed z-40 bg-white/95 backdrop-blur-md border-2 border-amber-500/80 p-3.5 sm:p-4 rounded-2xl shadow-2xl text-xs text-[#1A1A1A] w-72 sm:w-80 select-none ${
        isDragging ? 'cursor-grabbing shadow-inner opacity-90' : ''
      }`}
    >
      {/* Drag Handle & Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between pb-2 border-b border-amber-200 cursor-grab active:cursor-grabbing hover:bg-amber-50/50 -mx-1 px-1 rounded-t-xl transition-colors"
        title="드래그하여 위치 이동"
      >
        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs sm:text-sm">
          <GripHorizontal className="w-4 h-4 text-amber-500 shrink-0" />
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>관리자: 계정 정보</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 uppercase">
            {selectedUser.role}
          </span>
          {onClose && (
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-amber-100 cursor-pointer transition-colors"
              title="창 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Account Details */}
      <div className="mt-2.5 space-y-2 select-text">
        {/* Email */}
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200 gap-2">
          <div className="flex items-center gap-1.5 text-gray-600 font-medium text-[11px] shrink-0">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span>이메일</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="font-bold text-[#1A1A1A] font-mono text-xs truncate max-w-[140px]" title={selectedUser.email}>
              {selectedUser.email}
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => handleCopy(selectedUser.email, 'email', e)}
              className="p-1 hover:bg-gray-200 text-gray-500 rounded cursor-pointer transition-colors shrink-0"
              title="이메일 복사"
            >
              {copiedField === 'email' ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* UID */}
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200 gap-2">
          <div className="flex items-center gap-1.5 text-gray-600 font-medium text-[11px] shrink-0">
            <Key className="w-3.5 h-3.5 text-gray-400" />
            <span>UID</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="font-bold text-[#1A1A1A] font-mono text-[10px] truncate max-w-[130px]" title={selectedUser.uid}>
              {selectedUser.uid}
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => handleCopy(selectedUser.uid, 'uid', e)}
              className="p-1 hover:bg-gray-200 text-gray-500 rounded cursor-pointer transition-colors shrink-0"
              title="UID 복사"
            >
              {copiedField === 'uid' ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Password (if recorded or stored in doc) */}
        {selectedUser.password && (
          <div className="flex items-center justify-between bg-amber-50/80 p-2 rounded-xl border border-amber-200 gap-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-medium text-[11px] shrink-0">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>비밀번호</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-amber-900 font-mono text-xs bg-white px-2 py-0.5 rounded border border-amber-300 shadow-2xs">
                {selectedUser.password}
              </span>
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => handleCopy(selectedUser.password || '', 'password', e)}
                className="p-1 hover:bg-amber-200/60 text-amber-800 rounded cursor-pointer transition-colors shrink-0"
                title="비밀번호 복사"
              >
                {copiedField === 'password' ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Restriction Notice */}
      <div className="mt-2.5 pt-2 border-t border-amber-100 text-[11px] text-amber-800 flex items-start gap-1.5 leading-tight">
        <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <span>
          관리자 모드에서는 해당 사용자의 데이터를 <strong>조회만 가능</strong>하며, 수정을 할 수 없습니다.
        </span>
      </div>
    </div>
  );
};
