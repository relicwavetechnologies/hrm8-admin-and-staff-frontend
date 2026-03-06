import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Slider } from '@/shared/components/ui/slider';
import { 
  Mic, 
  MicOff, 
  Phone,
  Volume2,
  VolumeX,
  AlertCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";

interface PhoneControlsProps {
  micEnabled: boolean;
  volume: number;
  onToggleMic: () => void;
  onVolumeChange: (volume: number) => void;
  onEndCall: () => void;
  questionsAnswered: number;
  totalQuestions: number;
  duration: string;
  callActive: boolean;
}

export function PhoneControls({
  micEnabled,
  volume,
  onToggleMic,
  onVolumeChange,
  onEndCall,
  questionsAnswered,
  totalQuestions,
  duration,
  callActive
}: PhoneControlsProps) {
  const progress = (questionsAnswered / totalQuestions) * 100;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Call Status */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className={`h-3 w-3 rounded-full ${
              callActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-sm font-medium">
              {callActive ? 'Call Active' : 'Not Connected'}
            </span>
          </div>
          <p className="text-2xl font-bold tabular-nums">{duration}</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Interview Progress</span>
            <span className="text-muted-foreground">
              {questionsAnswered} of {totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Volume Control */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {volume > 0 ? (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">Volume</span>
            </div>
            <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
          </div>
          <Slider
            value={[volume * 100]}
            onValueChange={(values) => onVolumeChange(values[0] / 100)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          <Button
            variant={micEnabled ? 'default' : 'destructive'}
            size="lg"
            onClick={onToggleMic}
            disabled={!callActive}
            className="h-16"
          >
            {micEnabled ? (
              <>
                <Mic className="h-6 w-6 mr-2" />
                Mic On
              </>
            ) : (
              <>
                <MicOff className="h-6 w-6 mr-2" />
                Mic Off
              </>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="lg" 
                className="h-16"
                disabled={!callActive}
              >
                <Phone className="h-6 w-6 mr-2 rotate-[135deg]" />
                End Call
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Phone Interview?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to end this phone interview? This action cannot be undone.
                  {questionsAnswered < totalQuestions && (
                    <span className="block mt-2 text-warning">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      You have only answered {questionsAnswered} of {totalQuestions} questions.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Interview</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={onEndCall}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  End Call
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              micEnabled && callActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-xs text-muted-foreground">
              Microphone {micEnabled && callActive ? 'Active' : 'Muted'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${callActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              {callActive ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
