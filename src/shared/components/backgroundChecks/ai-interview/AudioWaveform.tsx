import { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  isSpeaking: boolean;
  color?: string;
}

export function AudioWaveform({ isActive, isSpeaking, color = 'hsl(var(--primary))' }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const barsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = 40;
    const barWidth = canvas.width / barCount;
    const centerY = canvas.height / 2;

    // Initialize bars
    if (barsRef.current.length === 0) {
      barsRef.current = Array(barCount).fill(0).map(() => Math.random() * 20 + 5);
    }

    let phase = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isActive && isSpeaking) {
        // Animate bars when speaking
        barsRef.current = barsRef.current.map((bar, i) => {
          const target = Math.sin(phase + i * 0.3) * 40 + 50;
          return bar + (target - bar) * 0.2;
        });
      } else if (isActive) {
        // Gentle idle animation when active but not speaking
        barsRef.current = barsRef.current.map((bar, i) => {
          const target = Math.sin(phase + i * 0.5) * 10 + 15;
          return bar + (target - bar) * 0.1;
        });
      } else {
        // Minimal animation when inactive
        barsRef.current = barsRef.current.map(bar => bar + (5 - bar) * 0.1);
      }

      // Draw bars
      barsRef.current.forEach((height, i) => {
        const x = i * barWidth;
        const barHeight = Math.max(height, 2);

        ctx.fillStyle = color;
        ctx.globalAlpha = isActive ? 1 : 0.3;
        
        // Draw bar from center
        ctx.fillRect(
          x + barWidth * 0.2,
          centerY - barHeight / 2,
          barWidth * 0.6,
          barHeight
        );
      });

      phase += isSpeaking ? 0.15 : 0.05;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isSpeaking, color]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={100}
      className="w-full h-full"
      style={{ maxHeight: '100px' }}
    />
  );
}
