import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface VideoFeedProps {
  stream: MediaStream | null;
  cameraEnabled: boolean;
  onToggleCamera: () => void;
}

export function VideoFeed({ stream, cameraEnabled, onToggleCamera }: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream && cameraEnabled) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        setIsLoading(false);
      };
    } else {
      setIsLoading(false);
    }
  }, [stream, cameraEnabled]);

  return (
    <div className="relative w-full h-full bg-muted/50 rounded-lg overflow-hidden">
      {cameraEnabled && stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <CameraOff className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Camera is off</p>
        </div>
      )}
      
      <div className="absolute bottom-4 right-4">
        <Button
          size="sm"
          variant={cameraEnabled ? 'default' : 'secondary'}
          onClick={onToggleCamera}
          className="gap-2"
        >
          {cameraEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          {cameraEnabled ? 'On' : 'Off'}
        </Button>
      </div>
    </div>
  );
}
