import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const MAX_ROTATE = 18; // degrees
const SHINE_SIZE = 400; // px

const FloatingDashboardPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(50);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = (x / rect.width) * 2 - 1;
    const percentY = (y / rect.height) * 2 - 1;
    animate(rotateY, percentX * MAX_ROTATE, { type: 'spring', stiffness: 200, damping: 20 });
    animate(rotateX, -percentY * MAX_ROTATE, { type: 'spring', stiffness: 200, damping: 20 });
    animate(shineX, (x / rect.width) * 100, { type: 'spring', stiffness: 200, damping: 30 });
    animate(shineY, (y / rect.height) * 100, { type: 'spring', stiffness: 200, damping: 30 });
  };

  const handleMouseLeave = () => {
    animate(rotateX, 0, { type: 'spring', stiffness: 200, damping: 20 });
    animate(rotateY, 0, { type: 'spring', stiffness: 200, damping: 20 });
    animate(shineX, 50, { type: 'spring', stiffness: 200, damping: 30 });
    animate(shineY, 50, { type: 'spring', stiffness: 200, damping: 30 });
  };

  // Shine gradient
  const shineStyle = {
    background: shineX && shineY ? `radial-gradient(circle at ${shineX.get()}% ${shineY.get()}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.0) 70%)` : undefined,
  };

  return (
    <motion.div
      ref={containerRef}
      className="w-full flex justify-center items-center relative"
      style={{ perspective: 1200, WebkitPerspective: 1200 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          boxShadow: '0 8px 40px 0 rgba(16, 30, 54, 0.10)',
          borderRadius: '1.5rem',
          willChange: 'transform',
        }}
        className="relative"
      >
        {children}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl transition-all"
          style={shineStyle}
        />
      </motion.div>
    </motion.div>
  );
};

export default FloatingDashboardPreview; 