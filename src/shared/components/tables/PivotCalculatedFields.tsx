import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card } from "@/shared/components/ui/card";
import { Plus, Trash2, Calculator } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "@/shared/hooks/use-toast";

export interface CalculatedField {
  id: string;
  name: string;
  formula: string;
  description?: string;
}

interface PivotCalculatedFieldsProps {
  calculatedFields: CalculatedField[];
  onCalculatedFieldsChange: (fields: CalculatedField[]) => void;
  availableFields: { key: string; label: string }[];
}

export function PivotCalculatedFields({
  calculatedFields,
  onCalculatedFieldsChange,
  availableFields,
}: PivotCalculatedFieldsProps) {
  const [newField, setNewField] = useState<Partial<CalculatedField>>({
    name: "",
    formula: "",
    description: "",
  });
  const [selectedField, setSelectedField] = useState<string>("");

  const addCalculatedField = () => {
    if (!newField.name || !newField.formula) {
      toast({
        title: "Invalid Field",
        description: "Please provide both name and formula",
        variant: "destructive",
      });
      return;
    }

    const field: CalculatedField = {
      id: `calc_${Date.now()}`,
      name: newField.name,
      formula: newField.formula,
      description: newField.description,
    };

    onCalculatedFieldsChange([...calculatedFields, field]);
    setNewField({ name: "", formula: "", description: "" });
    toast({
      title: "Field Added",
      description: `Calculated field "${field.name}" has been created`,
    });
  };

  const removeCalculatedField = (id: string) => {
    onCalculatedFieldsChange(calculatedFields.filter((f) => f.id !== id));
    toast({
      title: "Field Removed",
      description: "Calculated field has been deleted",
    });
  };

  const insertField = () => {
    if (selectedField) {
      setNewField({
        ...newField,
        formula: (newField.formula || "") + `[${selectedField}]`,
      });
      setSelectedField("");
    }
  };

  const insertOperator = (operator: string) => {
    setNewField({
      ...newField,
      formula: (newField.formula || "") + ` ${operator} `,
    });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5" />
          <h3 className="text-sm font-semibold">Create Calculated Field</h3>
        </div>
        
        <div className="space-y-3">
          <Input
            placeholder="Field Name"
            value={newField.name || ""}
            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
          />
          
          <Input
            placeholder="Description (optional)"
            value={newField.description || ""}
            onChange={(e) => setNewField({ ...newField, description: e.target.value })}
          />

          <div className="space-y-2">
            <div className="flex gap-2">
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Insert field..." />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={insertField} variant="outline" size="sm">
                Insert
              </Button>
            </div>

            <div className="flex gap-1 flex-wrap">
              {["+", "-", "*", "/", "(", ")", "SUM", "AVG", "MIN", "MAX"].map((op) => (
                <Button
                  key={op}
                  onClick={() => insertOperator(op)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {op}
                </Button>
              ))}
            </div>

            <Input
              placeholder="Formula (e.g., [field1] + [field2] * 100)"
              value={newField.formula || ""}
              onChange={(e) => setNewField({ ...newField, formula: e.target.value })}
              className="font-mono text-sm"
            />
          </div>

          <Button onClick={addCalculatedField} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Calculated Field
          </Button>
        </div>
      </Card>

      {calculatedFields.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Calculated Fields</label>
          {calculatedFields.map((field) => (
            <Card key={field.id} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{field.name}</Badge>
                  </div>
                  {field.description && (
                    <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                  )}
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                    {field.formula}
                  </code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCalculatedField(field.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function evaluateCalculatedField(
  formula: string,
  row: Record<string, unknown>,
  availableFields: { key: string; label: string }[]
): number {
  if (!formula) return 0;
  
  try {
    let expression = formula;
    
    // Replace field references with actual values
    availableFields.forEach((field) => {
      const fieldRegex = new RegExp(`\\[${field.key}\\]`, "g");
      const value = row[field.key];
      expression = expression.replace(fieldRegex, String(Number(value) || 0));
    });

    // Handle built-in functions (simplified)
    expression = expression.replace(/SUM\(([^)]+)\)/g, "$1");
    expression = expression.replace(/AVG\(([^)]+)\)/g, "$1");
    expression = expression.replace(/MIN\(([^)]+)\)/g, "$1");
    expression = expression.replace(/MAX\(([^)]+)\)/g, "$1");

    // Evaluate the expression safely (basic validation)
    if (!/^[0-9+\-*/(). ]+$/.test(expression)) {
      throw new Error("Invalid formula");
    }

     
    return eval(expression);
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return 0;
  }
}
