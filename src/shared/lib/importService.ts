import * as XLSX from 'xlsx';

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface ImportWarning {
  row: number;
  field: string;
  message: string;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  type: 'string' | 'number' | 'email' | 'date' | 'boolean';
}

export async function parseCSVFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file is empty or has no data rows'));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        }

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function validateData<T>(
  data: any[],
  fieldMappings: FieldMapping[]
): ImportResult<T> {
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];
  const validatedData: T[] = [];

  data.forEach((row, index) => {
    const validatedRow: any = {};
    let hasError = false;

    fieldMappings.forEach(mapping => {
      const value = row[mapping.sourceField];

      // Check required fields
      if (mapping.required && !value) {
        errors.push({
          row: index + 2, // +2 because row 1 is header, array is 0-indexed
          field: mapping.targetField,
          message: `${mapping.targetField} is required but missing`,
        });
        hasError = true;
        return;
      }

      // Type validation
      if (value) {
        switch (mapping.type) {
          case 'email':
            if (!isValidEmail(value)) {
              errors.push({
                row: index + 2,
                field: mapping.targetField,
                message: `Invalid email format: ${value}`,
              });
              hasError = true;
            }
            break;
          case 'number':
            if (isNaN(Number(value))) {
              errors.push({
                row: index + 2,
                field: mapping.targetField,
                message: `Invalid number format: ${value}`,
              });
              hasError = true;
            }
            break;
          case 'date':
            if (isNaN(Date.parse(value))) {
              warnings.push({
                row: index + 2,
                field: mapping.targetField,
                message: `Invalid date format: ${value}. Using current date.`,
              });
            }
            break;
        }
      }

      validatedRow[mapping.targetField] = value || '';
    });

    if (!hasError) {
      validatedData.push(validatedRow as T);
    }
  });

  return {
    success: errors.length === 0,
    data: validatedData,
    errors,
    warnings,
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getFieldSuggestions(headers: string[]): FieldMapping[] {
  const commonMappings: Record<string, FieldMapping> = {
    name: { sourceField: 'name', targetField: 'name', required: true, type: 'string' },
    fullname: { sourceField: 'fullname', targetField: 'name', required: true, type: 'string' },
    email: { sourceField: 'email', targetField: 'email', required: true, type: 'email' },
    'e-mail': { sourceField: 'e-mail', targetField: 'email', required: true, type: 'email' },
    phone: { sourceField: 'phone', targetField: 'phone', required: false, type: 'string' },
    position: { sourceField: 'position', targetField: 'jobTitle', required: false, type: 'string' },
    job: { sourceField: 'job', targetField: 'jobTitle', required: false, type: 'string' },
    status: { sourceField: 'status', targetField: 'status', required: false, type: 'string' },
    date: { sourceField: 'date', targetField: 'appliedDate', required: false, type: 'date' },
  };

  return headers
    .map(header => {
      const normalized = header.toLowerCase().trim();
      return commonMappings[normalized] || {
        sourceField: header,
        targetField: header,
        required: false,
        type: 'string' as const,
      };
    });
}
