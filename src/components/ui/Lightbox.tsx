import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex, isOpen, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setIndex(initialIndex);
    setDirection(0);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        setDirection(-1);
        setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setDirection(1);
        setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, images.length, onClose]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setDirection(1);
      setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
    if (isRightSwipe) {
      setDirection(-1);
      setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { clientX, currentTarget } = e;
    const { width, left } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    
    if (x < width * 0.3) {
      setDirection(-1);
      setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    } 
    else if (x > width * 0.7) {
      setDirection(1);
      setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
    else {
        onClose();
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xl flex items-center justify-center"
      onClick={onClose}
    >
      {/* Controls Layer - Top */}
      <div className="absolute inset-0 pointer-events-none z-[100001]">
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors pointer-events-auto p-4"
        >
          <X size={32} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(e); }}
          className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors hidden md:block pointer-events-auto p-4"
        >
          <ChevronLeft size={48} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleNext(e); }}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors hidden md:block pointer-events-auto p-4"
        >
          <ChevronRight size={48} />
        </button>
      </div>

      {/* Image Layer */}
      <div 
          className="relative w-full h-full flex items-center justify-center p-4 md:p-20 z-[100000]"
          onClick={handleClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
      >
          <AnimatePresence initial={false} custom={direction}>
            {images[index] ? (
              <motion.img
                  key={index}
                  src={images[index]}
                  custom={direction}
                  initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  alt={`Gallery ${index + 1}`}
                  className="absolute max-w-full max-h-full object-contain select-none rounded-xl shadow-2xl"
                  referrerPolicy="no-referrer"
                  draggable={false}
              />
            ) : (
              <div className="text-white">Image not found</div>
            )}
          </AnimatePresence>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 font-mono text-sm pointer-events-none bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              {index + 1} / {images.length}
          </div>
      </div>
    </div>,
    document.body
  );
}
