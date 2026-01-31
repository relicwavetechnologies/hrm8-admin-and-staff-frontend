import { useState, useMemo } from "react";
import { ApplicationQuestion } from "@/shared/types/applicationForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  getQuestionLibrary,
  deleteQuestionFromLibrary,
  getCategories,
} from "@/shared/lib/questionLibraryStorage";
import { getQuestionTypeIcon, getQuestionTypeLabel } from "@/shared/lib/applicationFormUtils";
import { Plus, Search, MoreVertical, Trash2, Sparkles, BookmarkCheck } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

interface QuestionLibraryBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectQuestion: (question: ApplicationQuestion) => void;
  currentQuestions: ApplicationQuestion[];
}

export function QuestionLibraryBrowser({
  open,
  onOpenChange,
  onSelectQuestion,
  currentQuestions,
}: QuestionLibraryBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const { toast } = useToast();

  const library = useMemo(() => getQuestionLibrary(), [open]);
  const categories = useMemo(() => getCategories(), [open]);

  const filteredQuestions = useMemo(() => {
    let questions = library;

    // Filter by tab
    if (selectedTab === 'system') {
      questions = questions.filter((q) => q.isSystemTemplate);
    } else if (selectedTab === 'saved') {
      questions = questions.filter((q) => !q.isSystemTemplate);
    } else if (selectedTab !== 'all') {
      // Category filter
      questions = questions.filter((q) => q.category === selectedTab);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      questions = questions.filter(
        (q) =>
          q.label.toLowerCase().includes(query) ||
          q.description?.toLowerCase().includes(query) ||
          getQuestionTypeLabel(q.type).toLowerCase().includes(query)
      );
    }

    return questions;
  }, [library, selectedTab, searchQuery]);

  const handleDelete = (libraryId: string) => {
    deleteQuestionFromLibrary(libraryId);
    toast({
      title: "Question Deleted",
      description: "Question removed from your library",
    });
  };

  const isQuestionInForm = (libraryId: string) => {
    return currentQuestions.some(
      (q: any) => q.libraryId === libraryId || q.id === libraryId
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookmarkCheck className="h-5 w-5" />
            Question Library
          </SheetTitle>
          <SheetDescription>
            Browse and add questions from your library
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All ({library.length})
              </TabsTrigger>
              <TabsTrigger value="system" className="flex-1">
                System ({library.filter((q) => q.isSystemTemplate).length})
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex-1">
                My Saved ({library.filter((q) => !q.isSystemTemplate).length})
              </TabsTrigger>
            </TabsList>

            {/* Category chips */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedTab === cat ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTab(selectedTab === cat ? 'all' : cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            )}

            <TabsContent value={selectedTab} className="mt-4">
              <ScrollArea className="h-[calc(100vh-300px)]">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? 'No questions found matching your search'
                        : 'No questions in this category yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    {filteredQuestions.map((question) => {
                      const TypeIcon = getQuestionTypeIcon(question.type);
                      const inForm = isQuestionInForm(question.libraryId);

                      return (
                        <Card key={question.libraryId}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="font-medium text-sm">
                                  {question.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {question.isSystemTemplate && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    System
                                  </Badge>
                                )}
                                {question.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {question.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          {question.description && (
                            <CardContent className="pb-3 pt-0">
                              <p className="text-sm text-muted-foreground">
                                {question.description}
                              </p>
                            </CardContent>
                          )}

                          <CardFooter className="pt-0 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {getQuestionTypeLabel(question.type)}
                              </Badge>
                              {question.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                              {question.usageCount !== undefined &&
                                question.usageCount > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    Used {question.usageCount}x
                                  </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => onSelectQuestion(question)}
                                disabled={inForm}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                {inForm ? 'Added' : 'Add'}
                              </Button>

                              {!question.isSystemTemplate && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(question.libraryId)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
