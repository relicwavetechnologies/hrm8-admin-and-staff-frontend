import type { Employee, EmploymentHistory, EmployeeDocument, EmployeeNote } from '@/shared/types/employee';
import { mockEmployees, mockEmploymentHistory, mockEmployeeDocuments, mockEmployeeNotes } from '@/shared/data/mockEmployeesData';

const EMPLOYEES_KEY = 'hrms_employees';
const EMPLOYMENT_HISTORY_KEY = 'hrms_employment_history';
const EMPLOYEE_DOCUMENTS_KEY = 'hrms_employee_documents';
const EMPLOYEE_NOTES_KEY = 'hrms_employee_notes';

// Employee CRUD
export function getEmployees(): Employee[] {
  const stored = localStorage.getItem(EMPLOYEES_KEY);
  return stored ? JSON.parse(stored) : mockEmployees;
}

export function getEmployeeById(id: string): Employee | undefined {
  return getEmployees().find(emp => emp.id === id);
}

export function saveEmployee(employee: Employee): void {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  
  if (index >= 0) {
    employees[index] = { ...employee, updatedAt: new Date().toISOString() };
  } else {
    employees.push({
      ...employee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
}

export function deleteEmployee(id: string): void {
  const employees = getEmployees().filter(e => e.id !== id);
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
}

// Employment History
export function getEmploymentHistory(employeeId: string): EmploymentHistory[] {
  const stored = localStorage.getItem(EMPLOYMENT_HISTORY_KEY);
  const history = stored ? JSON.parse(stored) : mockEmploymentHistory;
  return history.filter((h: EmploymentHistory) => h.employeeId === employeeId);
}

export function addEmploymentHistory(history: EmploymentHistory): void {
  const stored = localStorage.getItem(EMPLOYMENT_HISTORY_KEY);
  const allHistory = stored ? JSON.parse(stored) : mockEmploymentHistory;
  allHistory.push({
    ...history,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(EMPLOYMENT_HISTORY_KEY, JSON.stringify(allHistory));
}

// Employee Documents
export function getEmployeeDocuments(employeeId: string): EmployeeDocument[] {
  const stored = localStorage.getItem(EMPLOYEE_DOCUMENTS_KEY);
  const documents = stored ? JSON.parse(stored) : mockEmployeeDocuments;
  return documents.filter((d: EmployeeDocument) => d.employeeId === employeeId);
}

export function addEmployeeDocument(document: EmployeeDocument): void {
  const stored = localStorage.getItem(EMPLOYEE_DOCUMENTS_KEY);
  const documents = stored ? JSON.parse(stored) : mockEmployeeDocuments;
  documents.push({
    ...document,
    uploadedAt: new Date().toISOString(),
  });
  localStorage.setItem(EMPLOYEE_DOCUMENTS_KEY, JSON.stringify(documents));
}

export function deleteEmployeeDocument(id: string): void {
  const stored = localStorage.getItem(EMPLOYEE_DOCUMENTS_KEY);
  const documents = stored ? JSON.parse(stored) : mockEmployeeDocuments;
  const filtered = documents.filter((d: EmployeeDocument) => d.id !== id);
  localStorage.setItem(EMPLOYEE_DOCUMENTS_KEY, JSON.stringify(filtered));
}

// Employee Notes
export function getEmployeeNotes(employeeId: string): EmployeeNote[] {
  const stored = localStorage.getItem(EMPLOYEE_NOTES_KEY);
  const notes = stored ? JSON.parse(stored) : mockEmployeeNotes;
  return notes.filter((n: EmployeeNote) => n.employeeId === employeeId);
}

export function addEmployeeNote(note: EmployeeNote): void {
  const stored = localStorage.getItem(EMPLOYEE_NOTES_KEY);
  const notes = stored ? JSON.parse(stored) : mockEmployeeNotes;
  notes.push({
    ...note,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(EMPLOYEE_NOTES_KEY, JSON.stringify(notes));
}

export function deleteEmployeeNote(id: string): void {
  const stored = localStorage.getItem(EMPLOYEE_NOTES_KEY);
  const notes = stored ? JSON.parse(stored) : mockEmployeeNotes;
  const filtered = notes.filter((n: EmployeeNote) => n.id !== id);
  localStorage.setItem(EMPLOYEE_NOTES_KEY, JSON.stringify(filtered));
}
