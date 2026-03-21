// @ts-nocheck
import { useState, useEffect } from 'react';
import { documentHubService, CompanyDocument, DOCUMENT_CATEGORIES } from '@/shared/lib/documentHubService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Search, FileText, Loader2, FolderOpen, File } from 'lucide-react';

interface DocumentHubPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (documents: CompanyDocument[]) => void;
}

export function DocumentHubPicker({ open, onOpenChange, onSelect }: DocumentHubPickerProps) {
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) {
      setSelected(new Set());
      setSearch('');
      setCategory('ALL');
      return;
    }
    fetchDocs();
  }, [open, search, category]);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await documentHubService.getDocuments({ search: search || undefined, category });
      if (res.success && res.data) {
        setDocuments(res.data.documents);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const selectedDocs = documents.filter((d) => selected.has(d.id));
    onSelect(selectedDocs);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            Select from Documents Hub
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 py-2 border-b flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[320px]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-1">
              <FolderOpen className="h-8 w-8 opacity-30" />
              <p className="text-xs">No documents found</p>
              <p className="text-[11px]">Upload documents in the Documents Hub first</p>
            </div>
          ) : (
            <div className="divide-y">
              {documents.map((doc) => (
                <label
                  key={doc.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selected.has(doc.id)}
                    onCheckedChange={() => toggleSelect(doc.id)}
                  />
                  <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    {doc.mimeType?.includes('pdf') ? (
                      <FileText className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <File className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{doc.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{doc.fileName}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5 shrink-0">
                    {DOCUMENT_CATEGORIES.find((c) => c.value === doc.category)?.label || doc.category}
                  </Badge>
                </label>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="px-4 py-3 border-t">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-muted-foreground">
              {selected.size} selected
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button size="sm" className="h-8 text-xs" onClick={handleConfirm} disabled={selected.size === 0}>
                Attach Selected
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
