import { z } from "zod";
import * as XLSX from "xlsx";

export interface ImportField {
  sourceColumn?: string;
  targetField: string;
  label: string;
  required: boolean;
  dataType: 'text' | 'number' | 'date' | 'email' | 'phone' | 'array';
  transform?: (value: any) => any;
}

export interface ImportMapping {
  id: string;
  name: string;
  type: 'candidates' | 'jobs';
  fields: ImportField[];
  createdAt: string;
}

export interface ImportValidationError {
  row: number;
  field: string;
  value: any;
  error: string;
}

export interface DuplicateMatch {
  row: number;
  existingId: string;
  matchFields: string[];
  confidence: number;
  data: any;
}

export interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: DuplicateMatch[];
  errors: ImportValidationError[];
  sampleData: any[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ImportValidationError[];
  rollbackId?: string;
}

// Available fields for candidates
export const CANDIDATE_FIELDS: ImportField[] = [
  { sourceColumn: '', targetField: 'name', label: 'Name', required: true, dataType: 'text' },
  { sourceColumn: '', targetField: 'email', label: 'Email', required: true, dataType: 'email' },
  { sourceColumn: '', targetField: 'phone', label: 'Phone', required: false, dataType: 'phone' },
  { sourceColumn: '', targetField: 'location', label: 'Location', required: false, dataType: 'text' },
  { sourceColumn: '', targetField: 'currentRole', label: 'Current Role', required: false, dataType: 'text' },
  { sourceColumn: '', targetField: 'experience', label: 'Experience (years)', required: false, dataType: 'number' },
  { sourceColumn: '', targetField: 'skills', label: 'Skills', required: false, dataType: 'array', transform: (v) => v.split(',').map((s: string) => s.trim()) },
  { sourceColumn: '', targetField: 'education', label: 'Education', required: false, dataType: 'text' },
  { sourceColumn: '', targetField: 'salary', label: 'Salary', required: false, dataType: 'number' },
  { sourceColumn: '', targetField: 'availability', label: 'Availability', required: false, dataType: 'text' },
];

// Available fields for jobs
export const JOB_FIELDS: ImportField[] = [
  { sourceColumn: '', targetField: 'title', label: 'Title', required: true, dataType: 'text' },
  { sourceColumn: '', targetField: 'department', label: 'Department', required: true, dataType: 'text' },
  { sourceColumn: '', targetField: 'location', label: 'Location', required: true, dataType: 'text' },
  { sourceColumn: '', targetField: 'employmentType', label: 'Employment Type', required: true, dataType: 'text' },
  { sourceColumn: '', targetField: 'experienceLevel', label: 'Experience Level', required: true, dataType: 'text' },
  { sourceColumn: '', targetField: 'description', label: 'Description', required: true, dataType: 'text' },
  { sourceColumn: '', targetField: 'requirements', label: 'Requirements', required: false, dataType: 'array', transform: (v) => v.split('\n').filter(Boolean) },
  { sourceColumn: '', targetField: 'responsibilities', label: 'Responsibilities', required: false, dataType: 'array', transform: (v) => v.split('\n').filter(Boolean) },
  { sourceColumn: '', targetField: 'salaryMin', label: 'Minimum Salary', required: false, dataType: 'number' },
  { sourceColumn: '', targetField: 'salaryMax', label: 'Maximum Salary', required: false, dataType: 'number' },
  { sourceColumn: '', targetField: 'workArrangement', label: 'Work Arrangement', required: false, dataType: 'text' },
];

// Validation schemas
const candidateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  currentRole: z.string().max(200).optional(),
  experience: z.number().min(0).max(50).optional(),
  skills: z.array(z.string()).optional(),
  education: z.string().max(500).optional(),
  salary: z.number().positive().optional(),
  availability: z.string().optional(),
});

const jobSchema = z.object({
  title: z.string().min(1).max(200),
  department: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'casual']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  description: z.string().min(10).max(10000),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  workArrangement: z.enum(['on-site', 'remote', 'hybrid']).optional(),
});

export async function parseFile(file: File): Promise<{ headers: string[]; data: any[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) {
          reject(new Error('File is empty'));
          return;
        }

        const headers = jsonData[0].map((h) => String(h).trim());
        const rows = jsonData.slice(1).map((row) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        }).filter((row) => Object.values(row).some((v) => v !== undefined && v !== ''));

        resolve({ headers, data: rows });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function validateRow(
  row: any,
  mapping: ImportField[],
  type: 'candidates' | 'jobs',
  rowIndex: number
): ImportValidationError[] {
  const errors: ImportValidationError[] = [];
  const transformedData: any = {};

  // Apply mappings
  mapping.forEach((field) => {
    if (!field.sourceColumn) return;

    const value = row[field.sourceColumn];

    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push({
        row: rowIndex,
        field: field.targetField,
        value,
        error: `${field.targetField} is required`,
      });
      return;
    }

    // Transform value
    let transformedValue = value;
    if (field.transform && value) {
      try {
        transformedValue = field.transform(value);
      } catch (e) {
        errors.push({
          row: rowIndex,
          field: field.targetField,
          value,
          error: `Failed to transform ${field.targetField}`,
        });
        return;
      }
    }

    transformedData[field.targetField] = transformedValue;
  });

  // Validate with schema
  try {
    const schema = type === 'candidates' ? candidateSchema : jobSchema;
    schema.parse(transformedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        errors.push({
          row: rowIndex,
          field: err.path.join('.'),
          value: transformedData[err.path[0]],
          error: err.message,
        });
      });
    }
  }

  return errors;
}

export function detectDuplicates(
  data: any[],
  mapping: ImportField[],
  existingData: any[],
  type: 'candidates' | 'jobs'
): DuplicateMatch[] {
  const duplicates: DuplicateMatch[] = [];

  data.forEach((row, index) => {
    const transformedRow: any = {};
    mapping.forEach((field) => {
      if (field.sourceColumn && row[field.sourceColumn]) {
        transformedRow[field.targetField] = field.transform
          ? field.transform(row[field.sourceColumn])
          : row[field.sourceColumn];
      }
    });

    // Check for duplicates in existing data
    existingData.forEach((existing) => {
      const matchFields: string[] = [];
      let matchScore = 0;

      if (type === 'candidates') {
        // Match by email (primary key)
        if (transformedRow.email && transformedRow.email === existing.email) {
          matchFields.push('email');
          matchScore += 50;
        }
        // Match by name and phone
        if (
          transformedRow.name === existing.name &&
          transformedRow.phone === existing.phone
        ) {
          matchFields.push('name', 'phone');
          matchScore += 30;
        }
      } else {
        // Match jobs by title and department
        if (
          transformedRow.title === existing.title &&
          transformedRow.department === existing.department
        ) {
          matchFields.push('title', 'department');
          matchScore += 60;
        }
        // Match by location
        if (transformedRow.location === existing.location) {
          matchScore += 20;
        }
      }

      if (matchScore >= 50) {
        duplicates.push({
          row: index + 1,
          existingId: existing.id,
          matchFields,
          confidence: Math.min(matchScore, 100),
          data: transformedRow,
        });
      }
    });
  });

  return duplicates;
}

export function generateImportPreview(
  data: any[],
  mapping: ImportField[],
  existingData: any[],
  type: 'candidates' | 'jobs'
): ImportPreview {
  const errors: ImportValidationError[] = [];
  
  data.forEach((row, index) => {
    const rowErrors = validateRow(row, mapping, type, index + 1);
    errors.push(...rowErrors);
  });

  const duplicates = detectDuplicates(data, mapping, existingData, type);
  
  const validRows = data.length - errors.filter((e) => 
    mapping.find((m) => m.targetField === e.field)?.required
  ).length;

  return {
    totalRows: data.length,
    validRows,
    invalidRows: data.length - validRows,
    duplicates,
    errors,
    sampleData: data.slice(0, 5),
  };
}

export function exportToExcel(
  data: any[],
  fields: string[],
  filename: string
): void {
  const worksheetData = [
    fields,
    ...data.map((item) => fields.map((field) => {
      const value = item[field];
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return value?.toString() || '';
    })),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');

  // Auto-size columns
  const maxWidths = worksheetData[0].map((_, colIndex) => {
    return Math.max(
      ...worksheetData.map((row) => (row[colIndex]?.toString().length || 0))
    );
  });
  worksheet['!cols'] = maxWidths.map((width) => ({ wch: Math.min(width + 2, 50) }));

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToCSV(
  data: any[],
  fields: string[],
  filename: string
): void {
  const csvContent = [
    fields.join(','),
    ...data.map((item) =>
      fields.map((field) => {
        const value = item[field];
        if (Array.isArray(value)) {
          return `"${value.join(', ')}"`;
        }
        const str = value?.toString() || '';
        return str.includes(',') ? `"${str}"` : str;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Mock storage for rollback
const importHistory: Map<string, any[]> = new Map();

export function createRollbackPoint(
  type: 'candidates' | 'jobs',
  data: any[]
): string {
  const rollbackId = `${type}_${Date.now()}`;
  importHistory.set(rollbackId, JSON.parse(JSON.stringify(data)));
  return rollbackId;
}

export function rollback(rollbackId: string): any[] | null {
  return importHistory.get(rollbackId) || null;
}
