"use client";

import { useRouter } from "next/navigation";
import { useCRMStore } from "@/store/crm-store";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/page-header";
import { DataTable, ColumnDef, RowAction } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirmation-dialog";
import { useState } from "react";
import type { Estimate } from "@/data/estimates";

export default function EstimatesPage() {
  const router = useRouter();
  const { estimates, clients, deleteEstimate, restoreEstimate } = useCRMStore();
  const { addToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<Estimate | null>(null);

  const activeEstimates = estimates.filter((e) => !e.deletedAt);

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || clientId;
  };

  const isExpiringSoon = (validUntil: string): boolean => {
    if (!validUntil) return false;
    const until = new Date(validUntil);
    const now = new Date();
    const diffDays = Math.floor((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const columns: ColumnDef<Estimate>[] = [
    {
      key: "estimateNumber",
      header: "Estimate #",
      renderCell: (row) => <span className="font-semibold text-foreground font-mono">{row.estimateNumber}</span>,
      getValue: (row) => row.estimateNumber,
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
          {row.status === "sent" && isExpiringSoon(row.validUntil) && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
              Expiring soon
            </span>
          )}
        </div>
      ),
      getValue: (row) => row.status,
    },
    {
      key: "validUntil",
      header: "Valid Until",
      renderCell: (row) =>
        row.validUntil ? (
          <span className="text-xs text-muted-foreground font-mono">{new Date(row.validUntil).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        ) : (
          <span className="text-xs text-muted-foreground">--</span>
        ),
      getValue: (row) => row.validUntil,
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

  const rowActions: RowAction<Estimate>[] = [
    { label: "View", onClick: (row) => router.push(`/app/estimates/${row.id}`) },
    { label: "Edit", onClick: (row) => router.push(`/app/estimates/${row.id}/edit`) },
    {
      label: "Convert to Job",
      onClick: (row) => {
        if (row.status === "declined") {
          return addToast("Declined estimates cannot be converted to a job.", "error");
        }
        if (row.status === "expired") {
          addToast("This estimate is expired. Please review that current pricing is correct before creating a job.", "warning");
        }
        router.push(`/app/jobs/new?fromEstimate=${row.id}`);
      },
      hidden: (row) => row.status === "accepted" && !!row.jobId, // hide if already converted
    },
    { label: "Delete", variant: "destructive", onClick: (row) => setDeleteTarget(row) },
  ];

  return (
    <>
      <PageHeader title="Estimates" description={`${activeEstimates.length} total estimates`} actionLabel="+ New Estimate" actionHref="/app/estimates/new" />
      <DataTable
        data={activeEstimates}
        columns={columns}
        rowActions={rowActions}
        getRowId={(row) => row.id}
        onRowClick={(row) => router.push(`/app/estimates/${row.id}`)}
        searchPlaceholder="Search estimates..."
        emptyTitle="No estimates yet"
        emptyDescription="Create your first estimate to start quoting jobs."
        emptyActionLabel="+ New Estimate"
        emptyActionHref="/app/estimates/new"
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Estimate"
        message={`Are you sure you want to delete estimate ${deleteTarget?.estimateNumber}?`}
        onConfirm={() => { if (deleteTarget) { deleteEstimate(deleteTarget.id); addToast("Estimate deleted.", "success", () => restoreEstimate(deleteTarget.id)); setDeleteTarget(null); } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
