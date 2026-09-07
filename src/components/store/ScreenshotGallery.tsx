import React, { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScreenshotGalleryProps {
  screenshots?: string[];
  appName: string;
}

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ screenshots, appName }) => {
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
        No screenshots provided for this release.
      </div>
    );
  }

  return (
    <div>
      {/* Horizontal scrollable screenshots */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
        {screenshots.map((imgUrl, idx) => (
          <div
            key={idx}
            onClick={() => setActivePreviewIndex(idx)}
            className="group relative flex-shrink-0 w-44 sm:w-52 h-80 sm:h-96 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shadow-sm hover:shadow-md cursor-pointer transition-all snap-start"
          >
            <img
              src={imgUrl}
              alt={`${appName} screenshot ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=1400&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ZoomIn className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Modal Preview */}
      {activePreviewIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <button
            onClick={() => setActivePreviewIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          {screenshots.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePreviewIndex((prev) => (prev! - 1 + screenshots.length) % screenshots.length);
                }}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePreviewIndex((prev) => (prev! + 1) % screenshots.length);
                }}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={screenshots[activePreviewIndex]}
              alt={`${appName} preview`}
              className="max-h-[85vh] object-contain mx-auto"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 text-white text-xs font-mono">
            {activePreviewIndex + 1} of {screenshots.length}
          </div>
        </div>
      )}
    </div>
  );
};
