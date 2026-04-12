"use client";

import { useRouter } from "next/navigation";
import { useCRMStore } from "@/store/crm-store";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/page-header";
import { DataTable, ColumnDef, RowAction } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirmation-dialog";
import { useState } from "react";
import type { Worker } from "@/data/workers";

export default function WorkersPage() {
  const router = useRouter();
  const { workers, jobs, deleteWorker, restoreWorker } = useCRMStore();
  const { addToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<Worker | null>(null);

  const activeWorkers = workers.filter((w) => !w.deletedAt);

  const getActiveJobCount = (workerId: string) => {
    return jobs.filter(
      (j) => j.assignedWorkerIds.includes(workerId) && !j.deletedAt && j.status !== "completed" && j.status !== "cancelled"
    ).length;
  };

  const columns: ColumnDef<Worker>[] = [
    {
      key: "name",
      header: "Name",
      renderCell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase shrink-0">
            {row.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{row.name}</span>
            <span className="text-xs text-muted-foreground">{row.role}</span>
          </div>
        </div>
      ),
      getValue: (row) => row.name,
    },
    {
      key: "email",
      header: "Email",
      renderCell: (row) => <span className="text-muted-foreground text-sm">{row.email}</span>,
      getValue: (row) => row.email,
    },
    {
      key: "phone",
      header: "Phone",
      renderCell: (row) => <span className="text-muted-foreground font-mono text-xs">{row.phone}</span>,
      getValue: (row) => row.phone,
    },
    {
      key: "status",
      header: "Status",
      renderCell: (row) => <StatusBadge status={row.status} />,
      getValue: (row) => row.status,
    },
    {
      key: "hourlyRate",
      header: "Rate",
      align: "right",
      renderCell: (row) => <span className="font-mono text-sm">${row.hourlyRate.toFixed(2)}/hr</span>,
      getValue: (row) => row.hourlyRate,
    },
    {
      key: "activeJobs",
      header: "Active Jobs",
      align: "right",
      renderCell: (row) => {
        const count = getActiveJobCount(row.id);
        return <span className={`font-mono text-sm ${count > 0 ? "text-foreground" : "text-muted-foreground"}`}>{count}</span>;
      },
      getValue: (row) => getActiveJobCount(row.id),
    },
  ];

  const rowActions: RowAction<Worker>[] = [
    { label: "View", onClick: (row) => router.push(`/app/workers/${row.id}`) },
    { label: "Edit", onClick: (row) => router.push(`/app/workers/${row.id}/edit`) },
    { label: "Delete", variant: "destructive", onClick: (row) => setDeleteTarget(row) },
  ];

  return (
    <>
      <PageHeader title="Workers" description={`${activeWorkers.length} team members`} actionLabel="+ Add Worker" actionHref="/app/workers/new" />
      <DataTable
        data={activeWorkers}
        columns={columns}
        rowActions={rowActions}
        getRowId={(row) => row.id}
        onRowClick={(row) => router.push(`/app/workers/${row.id}`)}
        searchPlaceholder="Search workers..."
        emptyTitle="No workers yet"
        emptyDescription="Add your first team member."
        emptyActionLabel="+ Add Worker"
        emptyActionHref="/app/workers/new"
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Worker"
        message={`Are you sure you want to remove ${deleteTarget?.name}?`}
        onConfirm={() => { if (deleteTarget) { deleteWorker(deleteTarget.id); addToast("Worker removed.", "success", () => restoreWorker(deleteTarget.id)); setDeleteTarget(null); } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
