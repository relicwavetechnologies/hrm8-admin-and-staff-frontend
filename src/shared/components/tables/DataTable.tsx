import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableFilters, FilterOption, ActiveFilter } from "./TableFilters";
import { TablePagination } from "./TablePagination";
import { DataTableExport } from "./DataTableExport";
import { AdvancedFilters, DateRangeFilter, MultiSelectFilter, FilterPreset } from "./AdvancedFilters";
import { ColumnCustomization } from "./ColumnCustomization";
import { EditableCell, EditableFieldType, SelectOption } from "./EditableCell";
import { GroupConfig, GroupHeader, groupData, calculateAggregates } from "./TableGrouping";
import { PivotTable, PivotConfig } from "./PivotTable";
import { cn } from "@/shared/lib/utils";
import { useColumnResize } from "@/shared/hooks/useColumnResize";
import { ResizeHandle } from "./ResizeHandle";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T) => React.ReactNode;
  editable?: boolean;
  editFieldType?: EditableFieldType;
  editSelectOptions?: SelectOption[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  selectable?: boolean;
  onSelectedRowsChange?: (selectedIds: string[]) => void;
  renderBulkActions?: (selectedIds: string[]) => React.ReactNode;
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  statusFilter?: boolean;
  statusOptions?: FilterOption[];
  statusKey?: keyof T;
  typeFilter?: boolean;
  typeOptions?: FilterOption[];
  typeKey?: keyof T;
  emptyMessage?: string;
  exportable?: boolean;
  exportFilename?: string;
  // Advanced filtering
  dateRangeFilters?: DateRangeFilter[];
  dateRangeKey?: keyof T;
  multiSelectFilters?: MultiSelectFilter[];
  enableFilterPresets?: boolean;
  presetStorageKey?: string;
  // Column customization
  columnCustomization?: boolean;
  columnPreferenceKey?: string;
  // Inline editing
  inlineEditing?: boolean;
  onRowUpdate?: (id: string, updates: Partial<T>) => void;
  // Grouping and aggregation
  grouping?: GroupConfig;
  defaultGroupsExpanded?: boolean;
  // Pivot table
  pivotMode?: boolean;
  pivotConfig?: PivotConfig;
  onPivotConfigChange?: (config: PivotConfig) => void;
  // Row click handler
  onRowClick?: (item: T) => void;
  // Column resizing
  tableId?: string;
  resizable?: boolean;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  selectable = false,
  onSelectedRowsChange,
  renderBulkActions,
  searchable = false,
  searchKeys = [],
  statusFilter = false,
  statusOptions = [],
  statusKey,
  typeFilter = false,
  typeOptions = [],
  typeKey,
  emptyMessage = "No data available",
  exportable = false,
  exportFilename = "export",
  dateRangeFilters: initialDateRangeFilters = [],
  dateRangeKey,
  multiSelectFilters: initialMultiSelectFilters = [],
  enableFilterPresets = false,
  presetStorageKey = "table-filter-presets",
  columnCustomization = false,
  columnPreferenceKey = "table-column-preferences",
  inlineEditing = false,
  onRowUpdate,
  grouping,
  defaultGroupsExpanded = true,
  pivotMode = false,
  pivotConfig,
  onPivotConfigChange,
  onRowClick,
  tableId = "default-table",
  resizable = true,
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilterValue, setStatusFilterValue] = useState("all");
  const [typeFilterValue, setTypeFilterValue] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnKey: string } | null>(null);

  // Grouping state
  const [expandedGroups, setExpandedGroups] = useState<Set<string | number>>(() =>
    defaultGroupsExpanded ? new Set(['__all__']) : new Set()
  );

  // Column resizing
  const defaultWidths = useMemo(() => {
    const widths: { [key: string]: number } = {};
    columns.forEach((col) => {
      if (col.width && typeof col.width === 'string') {
        // Parse width string (e.g., "25%" or "200px") to pixels
        const match = col.width.match(/(\d+)(px|%)?/);
        if (match) {
          const value = parseInt(match[1]);
          widths[col.key] = match[2] === '%' ? (value / 100) * 1200 : value;
        }
      }
    });
    return widths;
  }, [columns]);

  const {
    // columnWidths,
    getColumnWidth,
    handleResizeStart: onResizeStart,
    resetWidths,
  } = useColumnResize({
    tableId,
    defaultWidths,
    minWidth: 80,
    maxWidth: 600,
  });

  // Advanced filtering state
  const [dateRangeFilters, setDateRangeFilters] = useState<DateRangeFilter[]>(initialDateRangeFilters);
  const [multiSelectFilters, setMultiSelectFilters] = useState<MultiSelectFilter[]>(initialMultiSelectFilters);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>(() => {
    if (!enableFilterPresets) return [];
    try {
      const stored = localStorage.getItem(presetStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Column customization state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (!columnCustomization) return columns.map(col => col.key);
    try {
      const stored = localStorage.getItem(`${columnPreferenceKey}-visible`);
      return stored ? JSON.parse(stored) : columns.map(col => col.key);
    } catch {
      return columns.map(col => col.key);
    }
  });

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (!columnCustomization) return columns.map(col => col.key);
    try {
      const stored = localStorage.getItem(`${columnPreferenceKey}-order`);
      const savedOrder = stored ? JSON.parse(stored) : null;
      if (savedOrder) {
        // Ensure all current columns are included
        const allKeys = columns.map(col => col.key);
        const validOrder = savedOrder.filter((key: string) => allKeys.includes(key));
        const missingKeys = allKeys.filter(key => !validOrder.includes(key));
        return [...validOrder, ...missingKeys];
      }
      return columns.map(col => col.key);
    } catch {
      return columns.map(col => col.key);
    }
  });

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select only items on the current page
      const items = paginatedData || (groupedData ? groupedData.flatMap(g => g.items) : []);
      const pageIds = items.map(item => item.id);
      const newSelectedIds = [...new Set([...selectedIds, ...pageIds])];
      setSelectedIds(newSelectedIds);
      onSelectedRowsChange?.(newSelectedIds);
    } else {
      // Deselect only items on the current page
      const items = paginatedData || (groupedData ? groupedData.flatMap(g => g.items) : []);
      const pageIds = items.map(item => item.id);
      const newSelectedIds = selectedIds.filter(id => !pageIds.includes(id));
      setSelectedIds(newSelectedIds);
      onSelectedRowsChange?.(newSelectedIds);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    let newSelectedIds: string[];
    if (checked) {
      newSelectedIds = [...selectedIds, id];
    } else {
      newSelectedIds = selectedIds.filter(selectedId => selectedId !== id);
    }
    setSelectedIds(newSelectedIds);
    onSelectedRowsChange?.(newSelectedIds);
  };

  // Advanced filter handlers
  const handleDateRangeChange = (key: string, from: Date | undefined, to: Date | undefined) => {
    setDateRangeFilters(prev =>
      prev.map(df => df.key === key ? { ...df, from, to } : df)
    );
    setCurrentPage(1);
  };

  const handleMultiSelectChange = (key: string, selected: string[]) => {
    setMultiSelectFilters(prev =>
      prev.map(mf => mf.key === key ? { ...mf, selected } : mf)
    );
    setCurrentPage(1);
  };

  const handleResetAdvancedFilters = () => {
    setDateRangeFilters(initialDateRangeFilters);
    setMultiSelectFilters(initialMultiSelectFilters);
    setCurrentPage(1);
  };

  const handleSavePreset = (preset: Omit<FilterPreset, 'id' | 'savedAt'>) => {
    const newPreset: FilterPreset = {
      ...preset,
      id: `preset-${Date.now()}`,
      savedAt: new Date().toISOString(),
    };
    const newPresets = [...filterPresets, newPreset];
    setFilterPresets(newPresets);
    if (enableFilterPresets) {
      localStorage.setItem(presetStorageKey, JSON.stringify(newPresets));
    }
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setDateRangeFilters(preset.dateRanges);
    const loadedMultiSelects = multiSelectFilters.map(mf => ({
      ...mf,
      selected: preset.multiSelects[mf.key] || [],
    }));
    setMultiSelectFilters(loadedMultiSelects);
    setCurrentPage(1);
  };

  const handleDeletePreset = (presetId: string) => {
    const newPresets = filterPresets.filter(p => p.id !== presetId);
    setFilterPresets(newPresets);
    if (enableFilterPresets) {
      localStorage.setItem(presetStorageKey, JSON.stringify(newPresets));
    }
  };

  // Column customization handlers
  const handleColumnVisibilityChange = (columnKey: string, visible: boolean) => {
    const newVisibleColumns = visible
      ? [...visibleColumns, columnKey]
      : visibleColumns.filter(key => key !== columnKey);
    setVisibleColumns(newVisibleColumns);
    if (columnCustomization) {
      localStorage.setItem(`${columnPreferenceKey}-visible`, JSON.stringify(newVisibleColumns));
    }
  };

  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrder(newOrder);
    if (columnCustomization) {
      localStorage.setItem(`${columnPreferenceKey}-order`, JSON.stringify(newOrder));
    }
  };

  const handleResetColumns = () => {
    const defaultColumns = columns.map(col => col.key);
    setVisibleColumns(defaultColumns);
    setColumnOrder(defaultColumns);
    if (columnCustomization) {
      localStorage.removeItem(`${columnPreferenceKey}-visible`);
      localStorage.removeItem(`${columnPreferenceKey}-order`);
    }
  };

  // Inline editing handlers
  const handleStartEdit = (rowId: string, columnKey: string) => {
    if (inlineEditing) {
      setEditingCell({ rowId, columnKey });
    }
  };

  const handleSaveEdit = (rowId: string, columnKey: string, value: unknown) => {
    if (onRowUpdate) {
      onRowUpdate(rowId, { [columnKey]: value } as Partial<T>);
    }
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  // Grouping handlers
  const toggleGroup = (groupValue: string | number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupValue)) {
        next.delete(groupValue);
      } else {
        next.add(groupValue);
      }
      return next;
    });
  };

  const toggleAllGroups = () => {
    if (expandedGroups.has('__all__')) {
      setExpandedGroups(new Set());
    } else {
      setExpandedGroups(new Set(['__all__']));
    }
  };

  const isGroupExpanded = (groupValue: string | number) => {
    return expandedGroups.has('__all__') || expandedGroups.has(groupValue);
  };

  // Get visible and ordered columns
  const displayColumns = useMemo(() => {
    if (!columnCustomization) return columns;

    const ordered = columnOrder
      .map(key => columns.find(col => col.key === key))
      .filter(Boolean) as Column<T>[];

    return ordered.filter(col => visibleColumns.includes(col.key));
  }, [columns, columnOrder, visibleColumns, columnCustomization]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchable && searchValue && searchKeys.length > 0) {
      result = result.filter(item =>
        searchKeys.some(key => {
          const value = item[key];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchValue.toLowerCase());
          }
          return false;
        })
      );
    }

    // Apply status filter
    if (statusFilter && statusFilterValue !== "all" && statusKey) {
      result = result.filter(item => item[statusKey] === statusFilterValue);
    }

    // Apply type filter
    if (typeFilter && typeFilterValue !== "all" && typeKey) {
      result = result.filter(item => item[typeKey] === typeFilterValue);
    }

    // Apply date range filters
    if (dateRangeKey && dateRangeFilters.length > 0) {
      dateRangeFilters.forEach(df => {
        if (df.from || df.to) {
          result = result.filter(item => {
            const itemValue = item[dateRangeKey];
            const itemDate = itemValue instanceof Date ? itemValue : new Date(String(itemValue));
            if (df.from && itemDate < df.from) return false;
            if (df.to && itemDate > df.to) return false;
            return true;
          });
        }
      });
    }

    // Apply multi-select filters
    multiSelectFilters.forEach(mf => {
      if (mf.selected.length > 0) {
        result = result.filter(item => {
          const itemValue = item[mf.key as keyof T];
          return mf.selected.includes(String(itemValue));
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchValue, searchKeys, statusFilterValue, typeFilterValue, sortConfig, searchable, statusFilter, typeFilter, statusKey, typeKey, dateRangeFilters, multiSelectFilters, dateRangeKey]);

  // Group data if grouping is enabled
  const groupedData = useMemo(() => {
    if (!grouping) return null;

    const groups = groupData(filteredAndSortedData, grouping.column);

    // Calculate aggregates for each group
    return groups.map((group) => ({
      ...group,
      aggregates: calculateAggregates(group.items, grouping.aggregates),
    }));
  }, [filteredAndSortedData, grouping]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = groupedData
    ? null // No pagination when grouping is enabled
    : filteredAndSortedData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

  // Active filters
  const activeFilters: ActiveFilter[] = [];
  if (searchValue) {
    activeFilters.push({ key: 'search', value: searchValue, label: `Search: "${searchValue}"` });
  }
  if (statusFilterValue !== 'all') {
    const statusLabel = statusOptions.find(opt => opt.value === statusFilterValue)?.label || statusFilterValue;
    activeFilters.push({ key: 'status', value: statusFilterValue, label: `Status: ${statusLabel}` });
  }
  if (typeFilterValue !== 'all') {
    const typeLabel = typeOptions.find(opt => opt.value === typeFilterValue)?.label || typeFilterValue;
    activeFilters.push({ key: 'type', value: typeFilterValue, label: `Type: ${typeLabel}` });
  }

  const handleClearFilter = (key: string) => {
    if (key === 'search') setSearchValue('');
    if (key === 'status') setStatusFilterValue('all');
    if (key === 'type') setTypeFilterValue('all');
  };

  const handleClearAll = () => {
    setSearchValue('');
    setStatusFilterValue('all');
    setTypeFilterValue('all');
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // If pivot mode is enabled, render pivot table instead
  if (pivotMode) {
    const pivotFields = columns.map((col) => ({
      key: col.key,
      label: col.label,
      type: typeof data[0]?.[col.key as keyof T] === "number" ? "number" as const : "string" as const,
    }));

    return (
      <div className="space-y-4">
        <PivotTable
          data={filteredAndSortedData}
          availableFields={pivotFields}
          initialConfig={pivotConfig}
          onConfigChange={onPivotConfigChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Export */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          {(searchable || statusFilter || typeFilter) && (
            <TableFilters
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              statusFilter={statusFilterValue}
              onStatusFilterChange={statusFilter ? setStatusFilterValue : undefined}
              statusOptions={statusFilter ? statusOptions : undefined}
              typeFilter={typeFilterValue}
              onTypeFilterChange={typeFilter ? setTypeFilterValue : undefined}
              typeOptions={typeFilter ? typeOptions : undefined}
              activeFilters={activeFilters}
              onClearFilter={handleClearFilter}
              onClearAll={handleClearAll}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {resizable && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetWidths}
              className="gap-2"
            >
              Reset Column Widths
            </Button>
          )}
          {columnCustomization && (
            <ColumnCustomization
              columns={columns}
              visibleColumns={visibleColumns}
              columnOrder={columnOrder}
              onVisibilityChange={handleColumnVisibilityChange}
              onOrderChange={handleColumnOrderChange}
              onReset={handleResetColumns}
            />
          )}
          {exportable && (
            <DataTableExport
              data={filteredAndSortedData}
              columns={columns}
              filename={exportFilename}
              selectedIds={selectedIds}
            />
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {(dateRangeFilters.length > 0 || multiSelectFilters.length > 0) && (
        <AdvancedFilters
          dateRangeFilters={dateRangeFilters}
          onDateRangeChange={handleDateRangeChange}
          multiSelectFilters={multiSelectFilters}
          onMultiSelectChange={handleMultiSelectChange}
          onResetFilters={handleResetAdvancedFilters}
          presets={enableFilterPresets ? filterPresets : undefined}
          onSavePreset={enableFilterPresets ? handleSavePreset : undefined}
          onLoadPreset={enableFilterPresets ? handleLoadPreset : undefined}
          onDeletePreset={enableFilterPresets ? handleDeletePreset : undefined}
        />
      )}

      {/* Bulk Actions */}
      {selectable && selectedIds.length > 0 && renderBulkActions && (
        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium">
            {selectedIds.length} row{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          {renderBulkActions(selectedIds)}
        </div>
      )}

      {/* Grouping Control */}
      {grouping && groupedData && (
        <div className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
          <span className="text-sm text-muted-foreground">
            Grouped by: <span className="font-medium">{grouping.label || grouping.column}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAllGroups}
          >
            {expandedGroups.has('__all__') ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      (paginatedData || filteredAndSortedData).length > 0 &&
                        (paginatedData || filteredAndSortedData).every(item => selectedIds.includes(item.id))
                        ? true
                        : (paginatedData || filteredAndSortedData).some(item => selectedIds.includes(item.id))
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all on this page"
                  />
                </TableHead>
              )}
              {displayColumns.map((column, index) => {
                const width = resizable ? getColumnWidth(column.key) : undefined;
                return (
                  <TableHead
                    key={column.key}
                    style={{
                      width: width ? `${width}px` : column.width,
                      position: 'relative',
                    }}
                  >
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(column.key)}
                        className="-ml-4 h-8 data-[state=open]:bg-accent"
                      >
                        {column.label}
                        {getSortIcon(column.key)}
                      </Button>
                    ) : (
                      column.label
                    )}
                    {resizable && index < displayColumns.length - 1 && (
                      <ResizeHandle
                        onResizeStart={(e) => {
                          e.preventDefault();
                          const th = e.currentTarget.parentElement;
                          const currentWidth = th?.offsetWidth || width || 150;
                          onResizeStart(column.key, e.clientX, currentWidth);
                        }}
                      />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData ? (
              // Render grouped data
              groupedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={displayColumns.length + (selectable ? 1 : 0)}
                    className="h-24 text-center"
                  >
                    <p className="text-muted-foreground">{emptyMessage}</p>
                  </TableCell>
                </TableRow>
              ) : (
                groupedData.map((group) => {
                  const isExpanded = isGroupExpanded(group.groupValue);
                  return (
                    <>
                      <GroupHeader
                        key={`group-${group.groupValue}`}
                        isExpanded={isExpanded}
                        onToggle={() => toggleGroup(group.groupValue)}
                        groupValue={group.groupValue}
                        count={group.items.length}
                        aggregates={group.aggregates}
                        groupConfig={grouping!}
                        colSpan={displayColumns.length + (selectable ? 1 : 0)}
                      />
                      {isExpanded &&
                        group.items.map((item) => (
                          <TableRow
                            key={item.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onRowClick) {
                                onRowClick(item);
                              }
                            }}
                            className={cn(onRowClick && "cursor-pointer")}
                          >
                            {selectable && (
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedIds.includes(item.id)}
                                  onCheckedChange={(checked) =>
                                    handleSelectRow(item.id, checked as boolean)
                                  }
                                  aria-label={`Select row ${item.id}`}
                                />
                              </TableCell>
                            )}
                            {displayColumns.map((column) => (
                              <TableCell key={column.key} style={{ width: column.width }}>
                                {inlineEditing && column.editable ? (
                                  <EditableCell
                                    value={item[column.key as keyof T]}
                                    onSave={(value) => handleSaveEdit(item.id, column.key, value)}
                                    onCancel={handleCancelEdit}
                                    fieldType={column.editFieldType}
                                    selectOptions={column.editSelectOptions}
                                    isEditing={
                                      editingCell?.rowId === item.id &&
                                      editingCell?.columnKey === column.key
                                    }
                                    onStartEdit={() => handleStartEdit(item.id, column.key)}
                                    renderView={column.render}
                                  />
                                ) : column.render ? (
                                  column.render(item)
                                ) : (
                                  String(item[column.key as keyof T] ?? '')
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                    </>
                  );
                })
              )
            ) : paginatedData && paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={displayColumns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <p className="text-muted-foreground">{emptyMessage}</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData && paginatedData.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onRowClick) {
                      onRowClick(item);
                    }
                  }}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                        aria-label={`Select row ${item.id}`}
                      />
                    </TableCell>
                  )}
                  {displayColumns.map((column) => (
                    <TableCell key={column.key} style={{ width: column.width }}>
                      {inlineEditing && column.editable ? (
                        <EditableCell
                          value={item[column.key as keyof T]}
                          onSave={(value) => handleSaveEdit(item.id, column.key, value)}
                          onCancel={handleCancelEdit}
                          fieldType={column.editFieldType}
                          selectOptions={column.editSelectOptions}
                          isEditing={
                            editingCell?.rowId === item.id &&
                            editingCell?.columnKey === column.key
                          }
                          onStartEdit={() => handleStartEdit(item.id, column.key)}
                          renderView={column.render}
                        />
                      ) : column.render ? (
                        column.render(item)
                      ) : (
                        String(item[column.key as keyof T] ?? '')
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - hidden when grouping is enabled */}
      {!grouping && filteredAndSortedData.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredAndSortedData.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}
