"use client";

import { useRouter } from "next/navigation";
import { useCRMStore } from "@/store/crm-store";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/page-header";
import { DataTable, ColumnDef, RowAction } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirmation-dialog";
import { useState } from "react";
import type { Client } from "@/data/clients";

export default function ClientsPage() {
  const router = useRouter();
  const { clients, deleteClient, restoreClient, getJobsForClient, getInvoicesForClient } = useCRMStore();
  const { addToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const activeClients = clients.filter((c) => !c.deletedAt);

  const columns: ColumnDef<Client>[] = [
    {
      key: "name",
      header: "Name",
      renderCell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          {row.company && (
            <span className="text-xs text-muted-foreground">{row.company}</span>
          )}
        </div>
      ),
      getValue: (row) => row.name,
    },
    {
      key: "email",
      header: "Email",
      renderCell: (row) => (
        <span className="text-muted-foreground">{row.email}</span>
      ),
      getValue: (row) => row.email,
    },
    {
      key: "phone",
      header: "Phone",
      renderCell: (row) => (
        <span className="text-muted-foreground font-mono text-xs">{row.phone}</span>
      ),
      getValue: (row) => row.phone,
    },
    {
      key: "status",
      header: "Status",
      renderCell: (row) => <StatusBadge status={row.status} />,
      getValue: (row) => row.status,
    },
    {
      key: "tags",
      header: "Tags",
      sortable: false,
      renderCell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium bg-secondary text-muted-foreground px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {row.tags.length > 2 && (
            <span className="text-[10px] font-medium text-muted-foreground">
              +{row.tags.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      renderCell: (row) => (
        <span className="text-muted-foreground text-xs" title={new Date(row.createdAt).toLocaleDateString()}>
          {formatRelativeDate(row.createdAt)}
        </span>
      ),
      getValue: (row) => row.createdAt,
    },
  ];

  const rowActions: RowAction<Client>[] = [
    {
      label: "View",
      onClick: (row) => router.push(`/app/clients/${row.id}`),
    },
    {
      label: "Edit",
      onClick: (row) => router.push(`/app/clients/${row.id}/edit`),
    },
    {
      label: "Delete",
      variant: "destructive",
      onClick: (row) => setDeleteTarget(row),
    },
  ];

  const handleDelete = () => {
    if (!deleteTarget) return;
    const jobs = getJobsForClient(deleteTarget.id);
    const invoices = getInvoicesForClient(deleteTarget.id);
    deleteClient(deleteTarget.id);
    addToast(`${deleteTarget.name} deleted.`, "success", () => restoreClient(deleteTarget.id));
    setDeleteTarget(null);
  };

  const deleteWarning = deleteTarget
    ? (() => {
        const jobs = getJobsForClient(deleteTarget.id);
        const invoices = getInvoicesForClient(deleteTarget.id);
        if (jobs.length > 0 || invoices.length > 0) {
          return `This client has ${jobs.length} linked job${jobs.length !== 1 ? "s" : ""} and ${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}. Deleting will remove all associations.`;
        }
        return undefined;
      })()
    : undefined;

  return (
    <>
      <PageHeader
        title="Clients"
        description={`${activeClients.length} total clients`}
        actionLabel="+ Add Client"
        actionHref="/app/clients/new"
      />
      <DataTable
        data={activeClients}
        columns={columns}
        rowActions={rowActions}
        getRowId={(row) => row.id}
        onRowClick={(row) => router.push(`/app/clients/${row.id}`)}
        searchPlaceholder="Search clients..."
        emptyTitle="No clients yet"
        emptyDescription="Add your first client to start tracking jobs and invoices."
        emptyActionLabel="+ Add Client"
        emptyActionHref="/app/clients/new"
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Client"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        warning={deleteWarning}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
