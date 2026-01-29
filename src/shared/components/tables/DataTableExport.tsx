import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Table } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/shared/hooks/use-toast";
import type { Column } from "./DataTable";

interface DataTableExportProps<T> {
  data: T[];
  columns: Column<T>[];
  filename: string;
  selectedIds?: string[];
}

export function DataTableExport<T extends { id: string }>({
  data,
  columns,
  filename,
  selectedIds = [],
}: DataTableExportProps<T>) {
  const { toast } = useToast();

  const getExportData = (useSelected: boolean) => {
    const exportData = useSelected && selectedIds.length > 0
      ? data.filter(item => selectedIds.includes(item.id))
      : data;

    // Format data for export - exclude action columns and use column labels
    return exportData.map(item => {
      const row: any = {};
      columns.forEach(column => {
        if (column.key !== 'actions') {
          const value = item[column.key as keyof T];
          row[column.label] = value != null ? String(value) : '';
        }
      });
      return row;
    });
  };

  const handleExportCSV = (useSelected: boolean) => {
    try {
      const exportData = getExportData(useSelected);
      
      if (exportData.length === 0) {
        toast({
          title: "No data to export",
          description: "Please select rows or ensure data is available",
          variant: "destructive",
        });
        return;
      }

      // Get headers from first object
      const headers = Object.keys(exportData[0]);
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle values that might contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: `Exported ${exportData.length} row${exportData.length !== 1 ? 's' : ''} as CSV`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data as CSV",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = (useSelected: boolean) => {
    try {
      const exportData = getExportData(useSelected);
      
      if (exportData.length === 0) {
        toast({
          title: "No data to export",
          description: "Please select rows or ensure data is available",
          variant: "destructive",
        });
        return;
      }

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      // Auto-size columns
      const maxWidth = 50;
      const colWidths = Object.keys(exportData[0]).map(key => {
        const maxLength = Math.max(
          key.length,
          ...exportData.map(row => String(row[key] || '').length)
        );
        return { wch: Math.min(maxLength + 2, maxWidth) };
      });
      worksheet['!cols'] = colWidths;

      // Save file
      XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: `Exported ${exportData.length} row${exportData.length !== 1 ? 's' : ''} as Excel`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data as Excel",
        variant: "destructive",
      });
    }
  };

  const hasSelected = selectedIds.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hasSelected && (
          <>
            <DropdownMenuItem onClick={() => handleExportCSV(true)}>
              <Table className="h-4 w-4 mr-2" />
              Export Selected as CSV ({selectedIds.length})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportExcel(true)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Selected as Excel ({selectedIds.length})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => handleExportCSV(false)}>
          <Table className="h-4 w-4 mr-2" />
          Export All as CSV ({data.length})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportExcel(false)}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export All as Excel ({data.length})
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
