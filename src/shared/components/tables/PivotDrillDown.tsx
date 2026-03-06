import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";

interface DrillDownData<T> {
  rowKey: string;
  colKey: string;
  fieldName: string;
  aggregation: string;
  records: T[];
}

interface PivotDrillDownProps<T> {
  isOpen: boolean;
  onClose: () => void;
  drillDownData: DrillDownData<T> | null;
  availableFields: { key: string; label: string; type?: "number" | "string" | "date" }[];
}

export function PivotDrillDown<T extends Record<string, any>>({
  isOpen,
  onClose,
  drillDownData,
  availableFields,
}: PivotDrillDownProps<T>) {
  if (!drillDownData) return null;

  const displayFields = availableFields.slice(0, 6); // Show first 6 fields

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              Drill-Down Details
              <div className="text-sm font-normal text-muted-foreground mt-1">
                <Badge variant="outline" className="mr-2">
                  {drillDownData.rowKey}
                </Badge>
                {drillDownData.colKey !== "Total" && (
                  <Badge variant="outline" className="mr-2">
                    {drillDownData.colKey}
                  </Badge>
                )}
                <Badge variant="secondary">
                  {drillDownData.aggregation}({drillDownData.fieldName})
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-2">
          Showing {drillDownData.records.length} record(s)
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {displayFields.map((field) => (
                  <TableHead key={field.key}>{field.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {drillDownData.records.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={displayFields.length}
                    className="text-center text-muted-foreground"
                  >
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                drillDownData.records.map((record, idx) => (
                  <TableRow key={idx}>
                    {displayFields.map((field) => (
                      <TableCell key={field.key}>
                        {String(record[field.key] || "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
