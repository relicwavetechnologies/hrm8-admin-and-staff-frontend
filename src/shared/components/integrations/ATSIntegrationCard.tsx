import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Link2, CheckCircle2, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import {
  connectATSProvider,
  disconnectATSIntegration,
  syncWithATS,
  getATSProviderInfo,
  type ATSProvider,
  type ATSIntegration,
} from "@/shared/lib/integrations/atsIntegrationService";

interface ATSIntegrationCardProps {
  provider: ATSProvider;
}

export function ATSIntegrationCard({ provider }: ATSIntegrationCardProps) {
  const { toast } = useToast();
  const providerInfo = getATSProviderInfo(provider);
  const [integration, setIntegration] = useState<ATSIntegration | undefined>(
    () => {
      const integrations = JSON.parse(localStorage.getItem('ats_integrations') || '[]');
      return integrations.find((i: ATSIntegration) => i.provider === provider);
    }
  );
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [syncDirection, setSyncDirection] = useState<'import' | 'export' | 'bidirectional'>('bidirectional');

  const handleConnect = async () => {
    if (!companyName || !apiKey) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const newIntegration = await connectATSProvider(provider, companyName, apiKey, apiUrl, syncDirection);
      setIntegration(newIntegration);
      setShowConnectDialog(false);
      toast({
        title: "Connected successfully",
        description: `${providerInfo.name} has been connected`,
      });
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to " + providerInfo.name,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (!integration) return;
    disconnectATSIntegration(integration.id);
    setIntegration(undefined);
    toast({
      title: "Disconnected",
      description: `${providerInfo.name} has been disconnected`,
    });
  };

  const handleSync = async () => {
    if (!integration) return;
    setIsSyncing(true);
    try {
      const result = await syncWithATS(integration.id);

      // Refresh integration to get updated lastSync
      const integrations = JSON.parse(localStorage.getItem('ats_integrations') || '[]');
      const updated = integrations.find((i: ATSIntegration) => i.id === integration.id);
      setIntegration(updated);

      toast({
        title: "Sync completed",
        description: `Imported ${result.candidatesImported} candidates, exported ${result.candidatesExported} candidates`,
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync with " + providerInfo.name,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Link2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {providerInfo.name}
                  {integration?.connected && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{providerInfo.description}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {integration?.connected ? (
            <>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  Company: <span className="text-foreground">{integration.companyName}</span>
                </p>
                <p className="text-muted-foreground">
                  Sync: <span className="text-foreground capitalize">{integration.syncDirection}</span>
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
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
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
                Connect to {providerInfo.name} to sync candidates and jobs between systems.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setShowConnectDialog(true)}>
                  Connect {providerInfo.name}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={providerInfo.setupGuideUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Setup Guide
                  </a>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {providerInfo.name}</DialogTitle>
            <DialogDescription>
              Enter your {providerInfo.name} API credentials to connect
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiUrl">API URL (optional)</Label>
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="syncDirection">Sync Direction</Label>
              <Select value={syncDirection} onValueChange={(v: any) => setSyncDirection(v)}>
                <SelectTrigger id="syncDirection">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="import">Import Only</SelectItem>
                  <SelectItem value="export">Export Only</SelectItem>
                  <SelectItem value="bidirectional">Bidirectional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
