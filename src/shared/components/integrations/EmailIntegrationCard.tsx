import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Mail, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import {
  connectEmailProvider,
  disconnectEmailIntegration,
  syncEmails,
  getEmailIntegration,
  type EmailProvider,
} from "@/shared/lib/integrations/emailIntegrationService";

interface EmailIntegrationCardProps {
  provider: EmailProvider;
  name: string;
  description: string;
}

export function EmailIntegrationCard({ provider, name, description }: EmailIntegrationCardProps) {
  const { toast } = useToast();
  const [integration, setIntegration] = useState(getEmailIntegration(provider));
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectEmailProvider(provider);
      setIntegration(getEmailIntegration(provider));
      toast({
        title: "Connected successfully",
        description: `${name} has been connected`,
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to " + name,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectEmailIntegration(provider);
    setIntegration(undefined);
    toast({
      title: "Disconnected",
      description: `${name} has been disconnected`,
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncEmails(provider);
      setIntegration(getEmailIntegration(provider));
      toast({
        title: "Sync completed",
        description: `Emails synced from ${name}`,
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync emails",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {name}
                {integration?.connected && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {integration?.connected ? (
          <>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">
                Email: <span className="text-foreground">{integration.email}</span>
              </p>
              <p className="text-muted-foreground">
                Connected: {new Date(integration.connectedAt!).toLocaleDateString()}
              </p>
              {integration.lastSync && (
                <p className="text-muted-foreground">
                  Last sync: {new Date(integration.lastSync).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                <XCircle className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Connect your {name} account to send emails and sync communications with candidates.
            </p>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : `Connect ${name}`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
