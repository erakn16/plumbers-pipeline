"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export type ColumnDef<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "right" | "center";
  renderCell?: (row: T) => React.ReactNode;
  getValue?: (row: T) => string | number;
};

export type RowAction<T> = {
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
  hidden?: (row: T) => boolean;
};

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  rowActions?: RowAction<T>[];
  onRowClick?: (row: T) => void;
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  loading?: boolean;
};

export function DataTable<T>({
  data,
  columns,
  rowActions,
  onRowClick,
  getRowId,
  searchPlaceholder = "Search...",
  emptyTitle = "No records found",
  emptyDescription = "No data matches your current filters.",
  emptyActionLabel,
  emptyActionHref,
  loading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [menuCoords, setMenuCoords] = useState<{ top: number, right: number, isUp: boolean } | null>(null);

  useEffect(() => {
    const handleScroll = () => { setOpenActionMenu(null); };
    if (openActionMenu) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      const tableWrap = document.querySelector(".overflow-x-auto");
      if (tableWrap) tableWrap.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      window.removeEventListener("scroll", handleScroll);
      const tableWrap = document.querySelector(".overflow-x-auto");
      if (tableWrap) tableWrap.removeEventListener("scroll", handleScroll);
    };
  }, [openActionMenu]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.getValue
          ? col.getValue(row)
          : (row as Record<string, unknown>)[col.key];
        return String(val ?? "").toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    return [...filtered].sort((a, b) => {
      const aVal = col?.getValue ? col.getValue(a) : (a as Record<string, unknown>)[sortKey];
      const bVal = col?.getValue ? col.getValue(b) : (b as Record<string, unknown>)[sortKey];
      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");
      const cmp = aStr.localeCompare(bStr, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortKey(null);
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const toggleAll = () => {
    if (selectedRows.size === paginated.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginated.map(getRowId)));
    }
  };

  // Skeleton rows
  if (loading) {
    return (
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="p-4">
          <div className="h-10 bg-secondary rounded-md animate-pulse w-64" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              {columns.map((_, ci) => (
                <div key={ci} className="h-4 bg-secondary rounded animate-pulse flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Search Bar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
        </div>
        {selectedRows.size > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{selectedRows.size} selected</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase font-semibold tracking-wider">
            <tr>
              <th className="px-5 py-3 w-10">
                <input
                  type="checkbox"
                  checked={paginated.length > 0 && selectedRows.size === paginated.length}
                  onChange={toggleAll}
                  className="rounded border-border accent-primary"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3 whitespace-nowrap ${col.sortable !== false ? "cursor-pointer select-none hover:text-foreground transition-colors" : ""} ${col.align === "right" ? "text-right" : ""}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable !== false && (
                      <>
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 opacity-30" />
                        )}
                      </>
                    )}
                  </span>
                </th>
              ))}
              {rowActions && rowActions.length > 0 && (
                <th className="px-5 py-3 w-12" />
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 2 : 1)}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    actionHref={emptyActionHref}
                  />
                </td>
              </tr>
            ) : (
              paginated.map((row, rowIndex) => {
                const rowId = getRowId(row);
                const openUpward = rowIndex >= paginated.length - 3 && paginated.length > 3;
                return (
                  <tr
                    key={rowId}
                    className={`transition-colors group ${onRowClick ? "cursor-pointer" : ""} ${selectedRows.has(rowId) ? "bg-primary/5" : "hover:bg-secondary/30"}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowId)}
                        onChange={() => toggleRow(rowId)}
                        className="rounded border-border accent-primary"
                      />
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-5 py-3 ${col.align === "right" ? "text-right font-mono" : ""}`}
                      >
                        {col.renderCell
                          ? col.renderCell(row)
                          : String((row as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                    {rowActions && rowActions.length > 0 && (
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <button
                            onClick={(e) => {
                              if (openActionMenu === rowId) {
                                setOpenActionMenu(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const isUp = window.innerHeight - rect.bottom < 150;
                                setMenuCoords({ 
                                  top: isUp ? rect.top : rect.bottom, 
                                  right: window.innerWidth - rect.right,
                                  isUp
                                });
                                setOpenActionMenu(rowId);
                              }
                            }}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors relative"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openActionMenu === rowId && menuCoords && typeof window !== "undefined" && createPortal(
                            <>
                              <div
                                className="fixed inset-0 z-[60]"
                                onClick={(e) => { e.stopPropagation(); setOpenActionMenu(null); }}
                              />
                              <div 
                                className={`fixed z-[70] bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] ${menuCoords.isUp ? "origin-bottom-right" : "origin-top-right"}`}
                                style={{
                                  top: menuCoords.isUp ? 'auto' : menuCoords.top + 4,
                                  bottom: menuCoords.isUp ? window.innerHeight - menuCoords.top + 4 : 'auto',
                                  right: menuCoords.right
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {rowActions
                                  .filter((a) => !a.hidden || !a.hidden(row))
                                  .map((action) => (
                                    <button
                                      key={action.label}
                                      onClick={() => {
                                        action.onClick(row);
                                        setOpenActionMenu(null);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                                        action.variant === "destructive"
                                          ? "text-destructive hover:bg-destructive/10"
                                          : "text-foreground hover:bg-secondary"
                                      }`}
                                    >
                                      {action.label}
                                    </button>
                                  ))}
                              </div>
                            </>,
                            document.body
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className="px-5 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{sorted.length} total records</span>
            <span className="text-border">|</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="bg-secondary border border-border rounded px-2 py-1 text-xs font-medium"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-md border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-muted-foreground font-medium px-2">
              {page + 1} / {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-md border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
