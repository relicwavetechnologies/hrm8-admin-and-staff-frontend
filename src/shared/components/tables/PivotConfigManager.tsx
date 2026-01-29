import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Save, FolderOpen, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

interface SavedConfig {
  id: string;
  name: string;
  config: any;
  savedAt: string;
}

interface PivotConfigManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: any;
  onLoadConfig: (config: any) => void;
  storageKey?: string;
}

export function PivotConfigManager({
  isOpen,
  onClose,
  currentConfig,
  onLoadConfig,
  storageKey = "pivot-configs",
}: PivotConfigManagerProps) {
  const [configName, setConfigName] = useState("");
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();

  const saveConfig = () => {
    if (!configName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this configuration",
        variant: "destructive",
      });
      return;
    }

    const newConfig: SavedConfig = {
      id: Date.now().toString(),
      name: configName,
      config: currentConfig,
      savedAt: new Date().toISOString(),
    };

    const updated = [...savedConfigs, newConfig];
    setSavedConfigs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    toast({
      title: "Configuration saved",
      description: `"${configName}" has been saved successfully`,
    });

    setConfigName("");
  };

  const loadConfig = (config: SavedConfig) => {
    onLoadConfig(config.config);
    toast({
      title: "Configuration loaded",
      description: `"${config.name}" has been loaded`,
    });
    onClose();
  };

  const deleteConfig = (id: string) => {
    const updated = savedConfigs.filter((c) => c.id !== id);
    setSavedConfigs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    toast({
      title: "Configuration deleted",
      description: "The configuration has been removed",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Save & Load Configurations</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Save Current Config */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Current Configuration
              </CardTitle>
              <CardDescription>
                Save your current pivot table setup for later use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Configuration name..."
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveConfig()}
                />
                <Button onClick={saveConfig}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Configurations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Saved Configurations
              </CardTitle>
              <CardDescription>
                {savedConfigs.length} saved configuration(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedConfigs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No saved configurations yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedConfigs.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{config.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Saved: {new Date(config.savedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadConfig(config)}
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteConfig(config.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
