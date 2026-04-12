"use client";

import { create } from "zustand";
import { clients as mockClients, Client } from "@/data/clients";
import { jobs as mockJobs, Job } from "@/data/jobs";
import { workers as mockWorkers, Worker } from "@/data/workers";
import { invoices as mockInvoices, Invoice } from "@/data/invoices";
import { estimates as mockEstimates, Estimate } from "@/data/estimates";
import { activityLog as mockActivity, ActivityEntry } from "@/data/activity";

export type { Client, Job, Worker, Invoice, Estimate, ActivityEntry };

// Accounts that receive mock data
const MOCK_DATA_ACCOUNTS = new Set(["usr_demo", "usr_admin_01"]);

interface CRMState {
  // Current account context
  _accountId: string | null;

  // Data
  clients: Client[];
  jobs: Job[];
  workers: Worker[];
  invoices: Invoice[];
  estimates: Estimate[];
  activity: ActivityEntry[];

  // Client CRUD
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  restoreClient: (id: string) => void;

  // Job CRUD
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  restoreJob: (id: string) => void;

  // Worker CRUD
  addWorker: (worker: Worker) => void;
  updateWorker: (id: string, updates: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  restoreWorker: (id: string) => void;

  // Invoice CRUD
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  restoreInvoice: (id: string) => void;

  // Estimate CRUD
  addEstimate: (estimate: Estimate) => void;
  updateEstimate: (id: string, updates: Partial<Estimate>) => void;
  deleteEstimate: (id: string) => void;
  restoreEstimate: (id: string) => void;

  // Activity
  addActivity: (entry: ActivityEntry) => void;

  // Helpers
  getClientById: (id: string) => Client | undefined;
  getJobById: (id: string) => Job | undefined;
  getWorkerById: (id: string) => Worker | undefined;
  getInvoiceById: (id: string) => Invoice | undefined;
  getEstimateById: (id: string) => Estimate | undefined;
  getJobsForClient: (clientId: string) => Job[];
  getInvoicesForClient: (clientId: string) => Invoice[];
  getEstimatesForClient: (clientId: string) => Estimate[];
  getJobsForWorker: (workerId: string) => Job[];
  getInvoicesForJob: (jobId: string) => Invoice[];

  // Account initialization
  initializeForAccount: (accountId: string) => void;
}

function getStorageKey(accountId: string) {
  return `pp_crm_${accountId}`;
}

function loadFromStorage(accountId: string): Partial<CRMState> | null {
  try {
    const raw = localStorage.getItem(getStorageKey(accountId));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveToStorage(accountId: string, state: CRMState) {
  try {
    const data = {
      clients: state.clients,
      jobs: state.jobs,
      workers: state.workers,
      invoices: state.invoices,
      estimates: state.estimates,
      activity: state.activity,
    };
    localStorage.setItem(getStorageKey(accountId), JSON.stringify(data));
  } catch { /* ignore */ }
}

function emptyData() {
  return {
    clients: [],
    jobs: [],
    workers: [],
    invoices: [],
    estimates: [],
    activity: [],
  };
}

function mockData() {
  return {
    clients: [...mockClients],
    jobs: [...mockJobs],
    workers: [...mockWorkers],
    invoices: [...mockInvoices],
    estimates: [...mockEstimates],
    activity: [...mockActivity],
  };
}

// Helper to persist after any mutation
function withPersist(set: (fn: (s: CRMState) => Partial<CRMState>) => void) {
  return (fn: (s: CRMState) => Partial<CRMState>) => {
    set((s) => {
      const result = fn(s);
      // Schedule persist after state update
      const newState = { ...s, ...result };
      if (newState._accountId) {
        // Use setTimeout to avoid calling during render
        setTimeout(() => saveToStorage(newState._accountId!, newState as CRMState), 0);
      }
      return result;
    });
  };
}

export const useCRMStore = create<CRMState>((rawSet, get) => {
  const set = withPersist(rawSet);

  return {
    _accountId: null,

    // Start with empty data -- will be populated by initializeForAccount
    ...emptyData(),

    // Account initialization
    initializeForAccount: (accountId: string) => {
      const current = get()._accountId;
      if (current === accountId) return; // Already initialized for this account

      // Try to load from localStorage first
      const stored = loadFromStorage(accountId);
      if (stored && stored.clients) {
        rawSet({
          _accountId: accountId,
          clients: stored.clients as Client[],
          jobs: stored.jobs as Job[],
          workers: stored.workers as Worker[],
          invoices: stored.invoices as Invoice[],
          estimates: stored.estimates as Estimate[],
          activity: stored.activity as ActivityEntry[],
        });
        return;
      }

      // No stored data -- seed based on account type
      const useMock = MOCK_DATA_ACCOUNTS.has(accountId);
      const data = useMock ? mockData() : emptyData();

      rawSet({
        _accountId: accountId,
        ...data,
      });

      // Persist the initial data
      saveToStorage(accountId, { ...get(), _accountId: accountId, ...data } as CRMState);
    },

    // Client CRUD
    addClient: (client) => set((s) => ({ clients: [client, ...s.clients] })),
    updateClient: (id, updates) =>
      set((s) => ({
        clients: s.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      })),
    deleteClient: (id) =>
      set((s) => ({
        clients: s.clients.map((c) =>
          c.id === id ? { ...c, deletedAt: new Date().toISOString() } : c
        ),
      })),
    restoreClient: (id) =>
      set((s) => ({
        clients: s.clients.map((c) =>
          c.id === id ? { ...c, deletedAt: null } : c
        ),
      })),

    // Job CRUD
    addJob: (job) => set((s) => ({ jobs: [job, ...s.jobs] })),
    updateJob: (id, updates) =>
      set((s) => ({
        jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
      })),
    deleteJob: (id) =>
      set((s) => ({
        jobs: s.jobs.map((j) =>
          j.id === id ? { ...j, deletedAt: new Date().toISOString() } : j
        ),
      })),
    restoreJob: (id) =>
      set((s) => ({
        jobs: s.jobs.map((j) => (j.id === id ? { ...j, deletedAt: null } : j)),
      })),

    // Worker CRUD
    addWorker: (worker) => set((s) => ({ workers: [worker, ...s.workers] })),
    updateWorker: (id, updates) =>
      set((s) => ({
        workers: s.workers.map((w) => (w.id === id ? { ...w, ...updates } : w)),
      })),
    deleteWorker: (id) =>
      set((s) => ({
        workers: s.workers.map((w) =>
          w.id === id ? { ...w, deletedAt: new Date().toISOString() } : w
        ),
      })),
    restoreWorker: (id) =>
      set((s) => ({
        workers: s.workers.map((w) =>
          w.id === id ? { ...w, deletedAt: null } : w
        ),
      })),

    // Invoice CRUD
    addInvoice: (invoice) =>
      set((s) => ({ invoices: [invoice, ...s.invoices] })),
    updateInvoice: (id, updates) =>
      set((s) => ({
        invoices: s.invoices.map((i) =>
          i.id === id ? { ...i, ...updates } : i
        ),
      })),
    deleteInvoice: (id) =>
      set((s) => ({
        invoices: s.invoices.map((i) =>
          i.id === id ? { ...i, deletedAt: new Date().toISOString() } : i
        ),
      })),
    restoreInvoice: (id) =>
      set((s) => ({
        invoices: s.invoices.map((i) =>
          i.id === id ? { ...i, deletedAt: null } : i
        ),
      })),

    // Estimate CRUD
    addEstimate: (estimate) =>
      set((s) => ({ estimates: [estimate, ...s.estimates] })),
    updateEstimate: (id, updates) =>
      set((s) => ({
        estimates: s.estimates.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      })),
    deleteEstimate: (id) =>
      set((s) => ({
        estimates: s.estimates.map((e) =>
          e.id === id ? { ...e, deletedAt: new Date().toISOString() } : e
        ),
      })),
    restoreEstimate: (id) =>
      set((s) => ({
        estimates: s.estimates.map((e) =>
          e.id === id ? { ...e, deletedAt: null } : e
        ),
      })),

    // Activity
    addActivity: (entry) =>
      set((s) => ({ activity: [entry, ...s.activity] })),

    // Helpers
    getClientById: (id) => get().clients.find((c) => c.id === id && !c.deletedAt),
    getJobById: (id) => get().jobs.find((j) => j.id === id && !j.deletedAt),
    getWorkerById: (id) => get().workers.find((w) => w.id === id && !w.deletedAt),
    getInvoiceById: (id) => get().invoices.find((i) => i.id === id && !i.deletedAt),
    getEstimateById: (id) => get().estimates.find((e) => e.id === id && !e.deletedAt),
    getJobsForClient: (clientId) =>
      get().jobs.filter((j) => j.clientId === clientId && !j.deletedAt),
    getInvoicesForClient: (clientId) =>
      get().invoices.filter((i) => i.clientId === clientId && !i.deletedAt),
    getEstimatesForClient: (clientId) =>
      get().estimates.filter((e) => e.clientId === clientId && !e.deletedAt),
    getJobsForWorker: (workerId) =>
      get().jobs.filter(
        (j) => j.assignedWorkerIds.includes(workerId) && !j.deletedAt
      ),
    getInvoicesForJob: (jobId) =>
      get().invoices.filter((i) => i.jobId === jobId && !i.deletedAt),
  };
});
