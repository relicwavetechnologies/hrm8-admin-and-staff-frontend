import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
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

interface InterviewControlsProps {
  micEnabled: boolean;
  speakerEnabled: boolean;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
  onEndInterview: () => void;
  questionsAnswered: number;
  totalQuestions: number;
  duration: string;
}

export function InterviewControls({
  micEnabled,
  speakerEnabled,
  onToggleMic,
  onToggleSpeaker,
  onEndInterview,
  questionsAnswered,
  totalQuestions,
  duration
}: InterviewControlsProps) {
  const progress = (questionsAnswered / totalQuestions) * 100;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Interview Progress</span>
            <span className="text-muted-foreground">
              {questionsAnswered} of {totalQuestions} questions
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Duration: {duration}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={micEnabled ? 'default' : 'destructive'}
            size="lg"
            onClick={onToggleMic}
            className="h-14"
          >
            {micEnabled ? (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Mic On
              </>
            ) : (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                Mic Off
              </>
            )}
          </Button>

          <Button
            variant={speakerEnabled ? 'default' : 'secondary'}
            size="lg"
            onClick={onToggleSpeaker}
            className="h-14"
          >
            {speakerEnabled ? (
              <>
                <Volume2 className="h-5 w-5 mr-2" />
                Audio On
              </>
            ) : (
              <>
                <VolumeX className="h-5 w-5 mr-2" />
                Audio Off
              </>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg" className="h-14">
                <Phone className="h-5 w-5 mr-2 rotate-[135deg]" />
                End
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Interview?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to end this interview? This action cannot be undone.
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
                <AlertDialogAction onClick={onEndInterview} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  End Interview
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${micEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              Microphone {micEnabled ? 'Active' : 'Muted'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${speakerEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              Audio {speakerEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
