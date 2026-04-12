"use client";

import { useRouter } from "next/navigation";
import { useCRMStore } from "@/store/crm-store";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/page-header";
import { DataTable, ColumnDef, RowAction } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirmation-dialog";
import { useState } from "react";
import type { Invoice } from "@/data/invoices";

export default function InvoicesPage() {
  const router = useRouter();
  const { invoices, clients, deleteInvoice, restoreInvoice, updateInvoice } = useCRMStore();
  const { addToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

  const activeInvoices = invoices.filter((i) => !i.deletedAt);

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || clientId;
  };

  const getDaysPastDue = (dueDate: string): number | null => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      key: "invoiceNumber",
      header: "Invoice #",
      renderCell: (row) => <span className="font-semibold text-foreground font-mono">{row.invoiceNumber}</span>,
      getValue: (row) => row.invoiceNumber,
    },
    {
      key: "clientId",
      header: "Client",
      renderCell: (row) => <span className="text-sm text-foreground">{getClientName(row.clientId)}</span>,
      getValue: (row) => getClientName(row.clientId),
    },
    {
      key: "status",
      header: "Status",
      renderCell: (row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={row.status} />
          {row.status === "overdue" && row.dueDate && (() => {
            const days = getDaysPastDue(row.dueDate);
            return days ? (
              <span className="text-[10px] font-medium text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded">
                {days}d overdue
              </span>
            ) : null;
          })()}
        </div>
      ),
      getValue: (row) => row.status,
    },
    {
      key: "issueDate",
      header: "Issue Date",
      renderCell: (row) =>
        row.issueDate ? (
          <span className="text-xs text-muted-foreground font-mono">{new Date(row.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        ) : (
          <span className="text-xs text-muted-foreground">--</span>
        ),
      getValue: (row) => row.issueDate,
    },
    {
      key: "dueDate",
      header: "Due Date",
      renderCell: (row) =>
        row.dueDate ? (
          <span className="text-xs text-muted-foreground font-mono">{new Date(row.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        ) : (
          <span className="text-xs text-muted-foreground">--</span>
        ),
      getValue: (row) => row.dueDate,
    },
    {
      key: "grandTotal",
      header: "Total",
      align: "right",
      renderCell: (row) => (
        <span className="font-mono font-semibold text-foreground">
          ${row.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      ),
      getValue: (row) => row.grandTotal,
    },
  ];

  const rowActions: RowAction<Invoice>[] = [
    { label: "View", onClick: (row) => router.push(`/app/invoices/${row.id}`) },
    { label: "Edit", onClick: (row) => router.push(`/app/invoices/${row.id}/edit`) },
    { label: "Mark as Paid", onClick: (row) => { updateInvoice(row.id, { status: "paid", paidDate: new Date().toISOString() }); addToast(`${row.invoiceNumber} marked as paid.`, "success"); }, hidden: (row) => row.status === "paid" || row.status === "draft" || row.status === "cancelled" },
    { label: "Delete", variant: "destructive", onClick: (row) => setDeleteTarget(row) },
  ];

  return (
    <>
      <PageHeader title="Invoices" description={`${activeInvoices.length} total invoices`} actionLabel="+ New Invoice" actionHref="/app/invoices/new" />
      <DataTable
        data={activeInvoices}
        columns={columns}
        rowActions={rowActions}
        getRowId={(row) => row.id}
        onRowClick={(row) => router.push(`/app/invoices/${row.id}`)}
        searchPlaceholder="Search invoices..."
        emptyTitle="No invoices yet"
        emptyDescription="Create your first invoice to start tracking payments."
        emptyActionLabel="+ New Invoice"
        emptyActionHref="/app/invoices/new"
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${deleteTarget?.invoiceNumber}?`}
        onConfirm={() => { if (deleteTarget) { deleteInvoice(deleteTarget.id); addToast("Invoice deleted.", "success", () => restoreInvoice(deleteTarget.id)); setDeleteTarget(null); } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
