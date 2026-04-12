"use client";

import { useRouter } from "next/navigation";
import { useCRMStore } from "@/store/crm-store";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/page-header";
import { DataTable, ColumnDef, RowAction } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirmation-dialog";
import { useState } from "react";
import type { Job } from "@/data/jobs";

export default function JobsPage() {
  const router = useRouter();
  const { jobs, clients, workers, deleteJob, restoreJob } = useCRMStore();
  const { addToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);

  const activeJobs = jobs.filter((j) => !j.deletedAt);

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || clientId;
  };

  const getWorkerNames = (workerIds: string[]) => {
    return workerIds
      .map((wid) => workers.find((w) => w.id === wid)?.name?.split(" ")[0] || "")
      .filter(Boolean)
      .join(", ");
  };

  const columns: ColumnDef<Job>[] = [
    {
      key: "title",
      header: "Job",
      renderCell: (row) => (
        <div className="flex flex-col max-w-[260px]">
          <span className="font-semibold text-foreground truncate">{row.title}</span>
          <span className="text-xs text-muted-foreground">{row.jobNumber || `WO-${row.id.slice(-6).toUpperCase()}`}</span>
        </div>
      ),
      getValue: (row) => row.title,
    },
    {
      key: "clientId",
      header: "Client",
      renderCell: (row) => (
        <span className="text-sm text-foreground">{getClientName(row.clientId)}</span>
      ),
      getValue: (row) => getClientName(row.clientId),
    },
    {
      key: "status",
      header: "Status",
      renderCell: (row) => <StatusBadge status={row.status} />,
      getValue: (row) => row.status,
    },
    {
      key: "priority",
      header: "Priority",
      renderCell: (row) => <StatusBadge status={row.priority} />,
      getValue: (row) => row.priority,
    },
    {
      key: "workers",
      header: "Assigned",
      sortable: false,
      renderCell: (row) => {
        const names = getWorkerNames(row.assignedWorkerIds);
        return names ? (
          <span className="text-sm text-muted-foreground">{names}</span>
        ) : (
          <span className="text-xs text-muted-foreground italic">Unassigned</span>
        );
      },
    },
    {
      key: "dueDate",
      header: "Due Date",
      renderCell: (row) =>
        row.dueDate ? (
          <span className="text-xs text-muted-foreground font-mono">
            {new Date(row.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">--</span>
        ),
      getValue: (row) => row.dueDate,
    },
    {
      key: "estimatedCost",
      header: "Est. Cost",
      align: "right",
      renderCell: (row) =>
        row.estimatedCost > 0 ? (
          <span className="text-sm font-mono">${row.estimatedCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        ) : (
          <span className="text-xs text-muted-foreground">--</span>
        ),
      getValue: (row) => row.estimatedCost,
    },
  ];

  const rowActions: RowAction<Job>[] = [
    { label: "View", onClick: (row) => router.push(`/app/jobs/${row.id}`) },
    { label: "Edit", onClick: (row) => router.push(`/app/jobs/${row.id}/edit`) },
    {
      label: "Convert to Invoice",
      onClick: (row) => {
        if (row.status === "cancelled") {
          return addToast("Cancelled jobs cannot be converted to an invoice.", "error");
        }
        if (row.status === "completed") {
          return addToast("This job is already completed. Create an invoice manually from the Invoices page.", "info");
        }
        const activeStatuses = ["open", "scheduled", "in-progress", "on-hold"];
        if (!activeStatuses.includes(row.status)) {
          return addToast("Only active jobs can be converted to an invoice.", "error");
        }
        router.push(`/app/invoices/new?fromJob=${row.id}`);
      },
      hidden: (row) => row.status === "cancelled",
    },
    { label: "Delete", variant: "destructive", onClick: (row) => setDeleteTarget(row) },
  ];

  return (
    <>
      <PageHeader title="Jobs" description={`${activeJobs.length} total jobs`} actionLabel="+ New Job" actionHref="/app/jobs/new" />
      <DataTable
        data={activeJobs}
        columns={columns}
        rowActions={rowActions}
        getRowId={(row) => row.id}
        onRowClick={(row) => router.push(`/app/jobs/${row.id}`)}
        searchPlaceholder="Search jobs..."
        emptyTitle="No jobs yet"
        emptyDescription="Create your first work order to start tracking jobs."
        emptyActionLabel="+ New Job"
        emptyActionHref="/app/jobs/new"
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Job"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={() => { if (deleteTarget) { deleteJob(deleteTarget.id); addToast("Job deleted.", "success", () => restoreJob(deleteTarget.id)); setDeleteTarget(null); } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
