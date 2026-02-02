import { useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';

interface AIAvatarDisplayProps {
  isSpeaking: boolean;
}

export function AIAvatarDisplay({ isSpeaking }: AIAvatarDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = isSpeaking ? 80 + Math.sin(phase) * 10 : 80;

      // Gradient background
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
      gradient.addColorStop(0, isSpeaking ? 'rgba(59, 130, 246, 0.3)' : 'rgba(100, 116, 139, 0.2)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Avatar circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = isSpeaking ? 'hsl(var(--primary))' : 'hsl(var(--muted))';
      ctx.fill();

      // Inner circles (speech waves)
      if (isSpeaking) {
        for (let i = 1; i <= 3; i++) {
          const waveRadius = radius + i * 20 + Math.sin(phase + i) * 5;
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 - i * 0.08})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // AI icon
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('AI', centerX, centerY);

      phase += isSpeaking ? 0.15 : 0.05;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isSpeaking]);

  return (
    <div className="relative flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="rounded-lg"
      />
      <div className="flex items-center gap-2">
        <Volume2 className={`h-5 w-5 ${isSpeaking ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
        <span className="text-sm font-medium text-muted-foreground">
          {isSpeaking ? 'AI Recruiter Speaking...' : 'AI Recruiter Listening'}
        </span>
      </div>
    </div>
  );
}
