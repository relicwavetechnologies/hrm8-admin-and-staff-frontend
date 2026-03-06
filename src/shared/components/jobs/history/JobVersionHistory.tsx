import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { History, RotateCcw, Eye } from "lucide-react";
import { getJobVersionHistory } from "@/shared/lib/jobVersioningService";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

interface JobVersionHistoryProps {
  jobId: string;
  onRevert?: (version: number) => void;
}

export function JobVersionHistory({ jobId, onRevert }: JobVersionHistoryProps) {
  const versions = getJobVersionHistory(jobId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Version History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No version history available
            </p>
          ) : (
            versions.map((version, index) => (
              <div
                key={version.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        v{version.version}
                      </Badge>
                      {index === 0 && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(version.changedAt, { addSuffix: true })} by {version.changedBy}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Version {version.version} Changes</DialogTitle>
                          <DialogDescription>
                            Changed {formatDistanceToNow(version.changedAt, { addSuffix: true })}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          {version.changes.map((change, i) => (
                            <div key={i} className="p-3 bg-muted rounded-lg">
                              <p className="font-medium text-sm">{change.label}</p>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    Old
                                  </Badge>
                                  <span className="text-sm line-through text-muted-foreground">
                                    {typeof change.oldValue === 'object'
                                      ? JSON.stringify(change.oldValue)
                                      : String(change.oldValue)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    New
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    {typeof change.newValue === 'object'
                                      ? JSON.stringify(change.newValue)
                                      : String(change.newValue)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                    {index !== 0 && onRevert && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRevert(version.version)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Revert
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Changes:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {version.changes.map((change, i) => (
                      <li key={i}>• {change.label} updated</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
