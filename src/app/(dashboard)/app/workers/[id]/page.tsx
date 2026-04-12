"use client";

import { use } from "react";
import { useCRMStore } from "@/store/crm-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { ArrowLeft, Mail, Phone, DollarSign, Briefcase, Calendar, Award } from "lucide-react";

export default function WorkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getWorkerById, getJobsForWorker } = useCRMStore();

  const worker = getWorkerById(id);
  if (!worker) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-foreground">Worker not found</h2>
        <Link href="/app/workers" className="text-primary text-sm mt-2 inline-block hover:underline">Back to Workers</Link>
      </div>
    );
  }

  const workerJobs = getJobsForWorker(worker.id);
  const activeJobs = workerJobs.filter((j) => j.status !== "completed" && j.status !== "cancelled");
  const completedJobs = workerJobs.filter((j) => j.status === "completed");

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/app/workers")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Workers
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase shrink-0">
            {worker.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{worker.name}</h1>
              <StatusBadge status={worker.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{worker.role} - {worker.department}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {worker.email}</span>
              <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {worker.phone}</span>
            </div>
          </div>
        </div>
        <Link href={`/app/workers/${worker.id}/edit`} className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98] shrink-0">
          Edit Worker
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><DollarSign className="w-4 h-4" /><span className="text-xs font-medium">Hourly Rate</span></div>
          <span className="text-xl font-bold text-foreground font-mono">${worker.hourlyRate.toFixed(2)}/hr</span>
        </div>
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Briefcase className="w-4 h-4" /><span className="text-xs font-medium">Active Jobs</span></div>
          <span className="text-xl font-bold text-foreground">{activeJobs.length}</span>
        </div>
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Briefcase className="w-4 h-4" /><span className="text-xs font-medium">Completed Jobs</span></div>
          <span className="text-xl font-bold text-foreground">{completedJobs.length}</span>
        </div>
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Calendar className="w-4 h-4" /><span className="text-xs font-medium">Hire Date</span></div>
          <span className="text-xl font-bold text-foreground">{new Date(worker.hireDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
        </div>
      </div>

      {/* Skills & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border rounded-xl bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {worker.skills.map((skill) => (
              <span key={skill} className="text-xs font-medium bg-secondary text-foreground px-2.5 py-1 rounded-md">{skill}</span>
            ))}
          </div>
        </div>
        <div className="border border-border rounded-xl bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Certifications</h3>
          </div>
          {worker.certifications.length > 0 ? (
            <div className="space-y-1.5">
              {worker.certifications.map((cert) => (
                <p key={cert} className="text-sm text-muted-foreground font-mono">{cert}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No certifications on file.</p>
          )}
        </div>
      </div>

      {/* Assigned Jobs */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Assigned Jobs ({workerJobs.length})</h3>
        </div>
        {workerJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-8 text-center">No jobs assigned to this worker.</p>
        ) : (
          <div className="divide-y divide-border">
            {workerJobs.slice(0, 10).map((job) => (
              <Link key={job.id} href={`/app/jobs/${job.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors">
                <div>
                  <span className="text-sm font-medium text-foreground">{job.title}</span>
                </div>
                <StatusBadge status={job.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
