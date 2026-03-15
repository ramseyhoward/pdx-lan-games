import {
  motion,
  type SpringOptions,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';

export interface BubbleBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  interactive?: boolean;
  transition?: SpringOptions;
  colors?: {
    first: string;
    second: string;
    third: string;
    fourth: string;
    fifth: string;
    sixth: string;
  };
}

export function BubbleBackground({
  className,
  children,
  interactive = false,
  transition = { stiffness: 100, damping: 20 },
  colors = {
    first: '106,30,85',
    second: '179,55,145',
    third: '133,14,53',
    fourth: '59,28,50',
    fifth: '133,14,53',
    sixth: '238,105,131',
  },
}: BubbleBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, transition);
  const springY = useSpring(mouseY, transition);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    },
    [mouseX, mouseY],
  );

  useEffect(() => {
    if (!interactive) return;
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, handleMouseMove]);

  const makeGradient = (color: string) =>
    `radial-gradient(circle at center, rgba(${color}, 0.8) 0%, rgba(${color}, 0) 50%)`;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: 'linear-gradient(to bottom right, #c260f0, #2f005b)',
      }}
    >
      <svg style={{ display: 'none' }} aria-hidden="true">
        <defs>
          <filter id="bubble-goo">
            <feGaussianBlur
              in="SourceGraphic"
              result="blur"
              stdDeviation="10"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              result="goo"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'url(#bubble-goo) blur(40px)',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            borderRadius: '50%',
            mixBlendMode: 'screen',
            width: '80%',
            height: '80%',
            top: '10%',
            left: '10%',
            background: makeGradient(colors.first),
          }}
          animate={{ y: [-50, 50, -50] }}
          transition={{
            duration: 30,
            ease: 'easeInOut',
            repeat: Number.POSITIVE_INFINITY,
          }}
        />

        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transformOrigin: 'calc(50% - 400px) center',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            ease: 'linear',
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <div
            style={{
              borderRadius: '50%',
              mixBlendMode: 'hard-light',
              width: '80%',
              height: '80%',
              background: makeGradient(colors.second),
            }}
          />
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transformOrigin: 'calc(50% + 400px) center',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 40,
            ease: 'linear',
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <div
            style={{
              position: 'absolute',
              borderRadius: '50%',
              mixBlendMode: 'hard-light',
              width: '80%',
              height: '80%',
              top: 'calc(50% + 200px)',
              left: 'calc(50% - 500px)',
              background: makeGradient(colors.third),
            }}
          />
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            borderRadius: '50%',
            mixBlendMode: 'hard-light',
            opacity: 0.7,
            width: '80%',
            height: '80%',
            top: '10%',
            left: '10%',
            background: makeGradient(colors.fourth),
          }}
          animate={{ x: [-50, 50, -50] }}
          transition={{
            duration: 40,
            ease: 'easeInOut',
            repeat: Number.POSITIVE_INFINITY,
          }}
        />

        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transformOrigin: 'calc(50% - 800px) calc(50% + 200px)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            ease: 'linear',
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <div
            style={{
              position: 'absolute',
              borderRadius: '50%',
              mixBlendMode: 'hard-light',
              width: '160%',
              height: '160%',
              top: 'calc(50% - 80%)',
              left: 'calc(50% - 80%)',
              background: makeGradient(colors.fifth),
            }}
          />
        </motion.div>

        {interactive && (
          <motion.div
            style={{
              position: 'absolute',
              borderRadius: '50%',
              mixBlendMode: 'hard-light',
              opacity: 0.7,
              width: '100%',
              height: '100%',
              background: makeGradient(colors.sixth),
              x: springX,
              y: springY,
            }}
          />
        )}
      </div>

      {children && (
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            height: '100%',
            width: '100%',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
