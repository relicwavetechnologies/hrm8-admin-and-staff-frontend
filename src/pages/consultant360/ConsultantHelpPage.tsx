import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";
import { HelpCircle, Book, MessageCircle, FileText } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function ConsultantHelpPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
                <p className="text-muted-foreground">Get assistance and learn how to use the platform</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader>
                        <Book className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>Documentation</CardTitle>
                        <CardDescription>Comprehensive guides and documentation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="link" className="px-0">Browse Articles &rarr;</Button>
                    </CardContent>
                </Card>

                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader>
                        <MessageCircle className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>Contact Support</CardTitle>
                        <CardDescription>Get help from our support team</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="link" className="px-0">Start Chat &rarr;</Button>
                    </CardContent>
                </Card>

                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader>
                        <FileText className="h-8 w-8 text-primary mb-2" />
                        <CardTitle>FAQs</CardTitle>
                        <CardDescription>Frequently asked questions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="link" className="px-0">View FAQs &rarr;</Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <HelpCircle className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">Need more help?</CardTitle>
                            <CardDescription>Our support team is available Mon-Fri, 9am-5pm EST</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        If you can't find what you're looking for in our documentation, feel free to reach out to our support team directly.
                    </p>
                    <Button>Contact Support</Button>
                </CardContent>
            </Card>
        </div>
    );
}
