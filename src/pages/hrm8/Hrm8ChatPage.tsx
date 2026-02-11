import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const SAMPLE_QUERIES = [
  "Show recent jobs posted by Rishihood University. Include total jobs and applications.",
  "What is the current status of job HRM8-1024?",
  "Find candidate by email and show their latest application status.",
  "Give hiring overview for a company with open jobs and pipeline counts.",
];

export default function Hrm8ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Chat Workspace</h1>
        <p className="text-muted-foreground">
          Use the resizable AI panel on the right to ask questions. It supports tool-call logs and Markdown answers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Suggested Test Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {SAMPLE_QUERIES.map((query) => (
              <li key={query} className="rounded-md border bg-muted/20 px-3 py-2">
                {query}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
