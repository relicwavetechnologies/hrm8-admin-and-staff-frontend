import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['⌘', 'K'], description: 'Open command palette', category: 'Navigation' },
  { keys: ['/'], description: 'Focus search', category: 'Navigation' },
  { keys: ['G', 'then', 'D'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['G', 'then', 'C'], description: 'Go to Candidates', category: 'Navigation' },
  { keys: ['G', 'then', 'J'], description: 'Go to Jobs', category: 'Navigation' },
  { keys: ['G', 'then', 'A'], description: 'Go to Applications', category: 'Navigation' },
  { keys: ['G', 'then', 'N'], description: 'Go to Analytics', category: 'Navigation' },
  { keys: ['G', 'then', 'S'], description: 'Go to Settings', category: 'Navigation' },
  { keys: ['G', 'then', 'H'], description: 'Go to Help', category: 'Navigation' },
  
  // Actions
  { keys: ['⌘', 'J'], description: 'Post a new job', category: 'Actions' },
  { keys: ['⌘', 'N'], description: 'Add new candidate', category: 'Actions' },
  
  // Help
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Help' },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleShowShortcuts = () => setOpen(true);
    window.addEventListener('show-shortcuts-dialog', handleShowShortcuts);

    return () => {
      window.removeEventListener('show-shortcuts-dialog', handleShowShortcuts);
    };
  }, []);

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs px-2 py-1"
                            >
                              {key}
                            </Badge>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-xs text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
              {category !== categories[categories.length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <p>
            💡 <strong>Tip:</strong> Press <Badge variant="outline" className="mx-1 font-mono">⌘ K</Badge> 
            anytime to open the command palette and search for pages or actions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}