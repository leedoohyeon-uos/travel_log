import React, { useState } from 'react';
import { PhotoMeta, TravelRecord } from '../types';
import { ChevronLeft, ChevronRight, Upload, Trash2, X, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetCode: string;
  targetType: 'country' | 'region';
  travelRecord: TravelRecord;
  photos: PhotoMeta[];
  onUploadPhoto: (file: File) => Promise<void>;
  onDeletePhoto: (photoId: string, storagePath: string) => Promise<void>;
  flag?: string;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  targetName,
  targetCode,
  targetType,
  travelRecord,
  photos,
  onUploadPhoto,
  onDeletePhoto,
  flag
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const maxPhotosAllowed = travelRecord?.visitCount || 0;
  const canUploadMore = photos.length < maxPhotosAllowed;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsUploading(true);
    try {
      await onUploadPhoto(file);
      setCurrentIndex(photos.length); // point to newly uploaded image
    } catch (err: any) {
      setErrorMessage(err.message || "사진 업로드 및 압축 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteCurrent = async () => {
    if (photos.length === 0) return;
    const currentPhoto = photos[currentIndex];
    if (!currentPhoto) return;

    if (!window.confirm("이 사진을 삭제하시겠습니까? (Firebase Storage와 DB에서 완전히 삭제됩니다)")) {
      return;
    }

    setErrorMessage(null);
    setIsDeleting(true);
    try {
      await onDeletePhoto(currentPhoto.photoId, currentPhoto.storagePath);
      setCurrentIndex(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setErrorMessage(err.message || "사진 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E2D9] flex items-center justify-between bg-[#F9F8F6]">
          <div className="flex items-center gap-2">
            {flag && <span className="text-2xl">{flag}</span>}
            <h3 className="font-serif italic text-lg text-[#3A3A3A] font-bold">{targetName} 여행 사진</h3>
            <span className="text-xs bg-[#F0EFEC] text-[#4B5E40] border border-[#E5E2D9] px-2.5 py-0.5 rounded-full font-bold">
              {photos.length} / {maxPhotosAllowed}장
            </span>
          </div>
          <button
            id="btn-close-photo-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Carousel or Empty State */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[320px]">
          {photos.length > 0 && currentPhoto ? (
            <div className="relative w-full flex flex-col items-center">
              
              {/* Image Preview */}
              <div className="relative w-full h-72 rounded-xl overflow-hidden bg-[#F5F5F0] border border-[#E5E2D9] flex items-center justify-center">
                <img
                  src={currentPhoto.downloadURL}
                  alt={`${targetName} photo`}
                  className="w-full h-full object-contain"
                />

                {/* Left/Right Carousel Controls */}
                {photos.length > 1 && (
                  <>
                    <button
                      id="btn-carousel-prev"
                      onClick={() => setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full border border-gray-200 shadow-md transition-transform hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      id="btn-carousel-next"
                      onClick={() => setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full border border-gray-200 shadow-md transition-transform hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Delete button overlay */}
                <button
                  id="btn-delete-photo"
                  onClick={handleDeleteCurrent}
                  disabled={isDeleting}
                  className="absolute top-3 right-3 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-transform hover:scale-105 disabled:opacity-50"
                  title="이 사진 삭제"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Carousel indicator (< 1 / N >) */}
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 font-medium">
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="hover:text-[#4B5E40] disabled:opacity-30 font-bold"
                >
                  &lt;
                </button>
                <span>
                  {currentIndex + 1} / {photos.length}
                </span>
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(photos.length - 1, prev + 1))}
                  disabled={currentIndex === photos.length - 1}
                  className="hover:text-[#4B5E40] disabled:opacity-30 font-bold"
                >
                  &gt;
                </button>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-[#F9F8F6] rounded-2xl border border-dashed border-[#E5E2D9] w-full">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-800 font-semibold mb-1">등록된 여행 사진이 없습니다.</p>
              <p className="text-xs text-gray-500 max-w-xs">
                방문 횟수({maxPhotosAllowed}회)에 따라 최대 {maxPhotosAllowed}장의 추억 사진을 등록할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#E5E2D9] bg-[#F9F8F6] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            {canUploadMore ? (
              <span>사진을 선택하면 자동 압축 후 업로드됩니다.</span>
            ) : (
              <span className="text-[#D4A373] font-bold">
                ⚠️ 방문 횟수({maxPhotosAllowed}회) 한도에 도달했습니다.
              </span>
            )}
          </div>

          <label
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-all ${
              canUploadMore && !isUploading
                ? 'bg-[#4B5E40] hover:bg-[#3d4d34] text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>압축 및 업로드 중...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>사진 업로드 ({photos.length}/{maxPhotosAllowed})</span>
              </>
            )}
            <input
              id="file-upload-input"
              type="file"
              accept="image/*"
              disabled={!canUploadMore || isUploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

      </div>
    </div>
  );
};
