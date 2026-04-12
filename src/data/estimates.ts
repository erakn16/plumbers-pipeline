export type EstimateLineItem = {
  lineType?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  taxRate?: number;
  taxNote?: string;
};

export type Estimate = {
  id: string;
  estimateNumber: string;
  customerPO: string | null;
  serviceAddress: string | null;
  clientId: string;
  jobId: string | null;
  status: "draft" | "sent" | "accepted" | "declined" | "expired" | "job_created";
  validUntil: string;
  lineItems: EstimateLineItem[];
  subtotal: number;
  taxTotal: number;
  discount: number;
  grandTotal: number;
  terms: string;
  notes: string;
  createdAt: string;
  deletedAt: string | null;
};

function calcTotals(items: EstimateLineItem[], discount: number = 0): { subtotal: number; taxTotal: number; grandTotal: number } {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxTotal = items.reduce((s, i) => s + i.tax, 0);
  return { subtotal, taxTotal, grandTotal: subtotal + taxTotal - discount };
}

export const estimates: Estimate[] = [
  {
    id: "est_001",
    estimateNumber: "EST-1027",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_010",
    jobId: null,
    status: "sent",
    validUntil: "2026-04-30T00:00:00Z",
    lineItems: [
      { description: "Operatory Plumbing Retrofit (x4 stations)", quantity: 4, unitPrice: 2800.00, tax: 840.00 },
      { description: "Vacuum Line Replacement", quantity: 1, unitPrice: 3200.00, tax: 240.00 },
      { description: "Air Compressor Line Replacement", quantity: 1, unitPrice: 1800.00, tax: 135.00 },
      { description: "Permit Fees", quantity: 1, unitPrice: 250.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Operatory Plumbing Retrofit (x4 stations)", quantity: 4, unitPrice: 2800.00, tax: 840.00 },
      { description: "Vacuum Line Replacement", quantity: 1, unitPrice: 3200.00, tax: 240.00 },
      { description: "Air Compressor Line Replacement", quantity: 1, unitPrice: 1800.00, tax: 135.00 },
      { description: "Permit Fees", quantity: 1, unitPrice: 250.00, tax: 0 },
    ]),
    discount: 0,
    terms: "50% deposit required before work begins. Balance due on completion. Estimate valid for 30 days.",
    notes: "Pricing assumes after-hours work. If daytime access becomes available, labor costs may decrease.",
    createdAt: "2026-03-15T14:00:00Z",
    deletedAt: null,
  },
  {
    id: "est_002",
    estimateNumber: "EST-1024",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_013",
    jobId: "job_019",
    status: "sent",
    validUntil: "2026-05-15T00:00:00Z",
    lineItems: [
      { description: "Full House Repipe - PEX (approx. 1,800 sq ft)", quantity: 1, unitPrice: 8500.00, tax: 637.50 },
      { description: "Drywall Access Patches - GC Coordination", quantity: 1, unitPrice: 1200.00, tax: 90.00 },
      { description: "Fixture Reconnection (x8)", quantity: 8, unitPrice: 185.00, tax: 111.00 },
      { description: "Water Heater Reconnection", quantity: 1, unitPrice: 350.00, tax: 26.25 },
      { description: "Permit & Inspections", quantity: 1, unitPrice: 450.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Full House Repipe - PEX (approx. 1,800 sq ft)", quantity: 1, unitPrice: 8500.00, tax: 637.50 },
      { description: "Drywall Access Patches - GC Coordination", quantity: 1, unitPrice: 1200.00, tax: 90.00 },
      { description: "Fixture Reconnection (x8)", quantity: 8, unitPrice: 185.00, tax: 111.00 },
      { description: "Water Heater Reconnection", quantity: 1, unitPrice: 350.00, tax: 26.25 },
      { description: "Permit & Inspections", quantity: 1, unitPrice: 450.00, tax: 0 },
    ]),
    discount: 0,
    terms: "50% deposit required. Progress billing at 50% completion. Balance due on final inspection. Valid 60 days.",
    notes: "Based on camera inspection findings. Galvanized pipe throughout house shows significant corrosion. Price assumes standard access. Additional drywall or flooring work NOT included.",
    createdAt: "2026-04-08T11:00:00Z",
    deletedAt: null,
  },
  {
    id: "est_003",
    estimateNumber: "EST-1022",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_014",
    jobId: "job_003",
    status: "accepted",
    validUntil: "2026-04-01T00:00:00Z",
    lineItems: [
      { description: "Kohler Composed Faucet (K-73050) - Chrome", quantity: 6, unitPrice: 485.00, tax: 218.25 },
      { description: "Toto Prism Toilet (CT172)", quantity: 4, unitPrice: 420.00, tax: 126.00 },
      { description: "Demolition & Removal of Existing Fixtures", quantity: 1, unitPrice: 650.00, tax: 0 },
      { description: "Labor - After-Hours Installation (est. 32 hrs)", quantity: 32, unitPrice: 118.00, tax: 0 },
      { description: "Permit Fee", quantity: 1, unitPrice: 185.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Kohler Composed Faucet (K-73050) - Chrome", quantity: 6, unitPrice: 485.00, tax: 218.25 },
      { description: "Toto Prism Toilet (CT172)", quantity: 4, unitPrice: 420.00, tax: 126.00 },
      { description: "Demolition & Removal of Existing Fixtures", quantity: 1, unitPrice: 650.00, tax: 0 },
      { description: "Labor - After-Hours Installation (est. 32 hrs)", quantity: 32, unitPrice: 118.00, tax: 0 },
      { description: "Permit Fee", quantity: 1, unitPrice: 185.00, tax: 0 },
    ]),
    discount: 0,
    terms: "50% deposit. Balance on completion. After-hours rates apply (6 PM - 11 PM).",
    notes: "High-end fixture upgrade for law office. All work after business hours. Security badge access coordinated with building management.",
    createdAt: "2026-03-20T10:00:00Z",
    deletedAt: null,
  },
  {
    id: "est_004",
    estimateNumber: "EST-1025",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_024",
    jobId: null,
    status: "sent",
    validUntil: "2026-04-30T00:00:00Z",
    lineItems: [
      { description: "Rinnai RU199iN Tankless Water Heater", quantity: 1, unitPrice: 1850.00, tax: 138.75 },
      { description: "Gas Line Extension to New Location", quantity: 1, unitPrice: 680.00, tax: 51.00 },
      { description: "Condensate Drain Installation", quantity: 1, unitPrice: 320.00, tax: 24.00 },
      { description: "Recirculation Loop Installation", quantity: 1, unitPrice: 450.00, tax: 33.75 },
      { description: "Remove & Dispose Existing Tank Heater", quantity: 1, unitPrice: 175.00, tax: 0 },
      { description: "Labor - Installation (est. 7 hrs)", quantity: 7, unitPrice: 118.00, tax: 0 },
      { description: "Permit Fee", quantity: 1, unitPrice: 125.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Rinnai RU199iN Tankless Water Heater", quantity: 1, unitPrice: 1850.00, tax: 138.75 },
      { description: "Gas Line Extension to New Location", quantity: 1, unitPrice: 680.00, tax: 51.00 },
      { description: "Condensate Drain Installation", quantity: 1, unitPrice: 320.00, tax: 24.00 },
      { description: "Recirculation Loop Installation", quantity: 1, unitPrice: 450.00, tax: 33.75 },
      { description: "Remove & Dispose Existing Tank Heater", quantity: 1, unitPrice: 175.00, tax: 0 },
      { description: "Labor - Installation (est. 7 hrs)", quantity: 7, unitPrice: 118.00, tax: 0 },
      { description: "Permit Fee", quantity: 1, unitPrice: 125.00, tax: 0 },
    ]),
    discount: 0,
    terms: "Payment due on completion. Includes 1-year labor warranty.",
    notes: "Tankless conversion for residential home. Existing 40-gal tank to be removed.",
    createdAt: "2026-04-02T14:00:00Z",
    deletedAt: null,
  },
  {
    id: "est_005",
    estimateNumber: "EST-1019",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_004",
    jobId: "job_015",
    status: "accepted",
    validUntil: "2026-03-31T00:00:00Z",
    lineItems: [
      { description: "Vacuum Line Replacement - Operatory Room 2", quantity: 1, unitPrice: 1800.00, tax: 135.00 },
      { description: "Compressed Air Line Replacement", quantity: 1, unitPrice: 1400.00, tax: 105.00 },
      { description: "Amalgam Separator Installation (Solmetex NXT)", quantity: 1, unitPrice: 1250.00, tax: 93.75 },
      { description: "Labor - After-Hours (est. 12 hrs)", quantity: 12, unitPrice: 118.00, tax: 0 },
      { description: "EPA Compliance Documentation", quantity: 1, unitPrice: 150.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Vacuum Line Replacement - Operatory Room 2", quantity: 1, unitPrice: 1800.00, tax: 135.00 },
      { description: "Compressed Air Line Replacement", quantity: 1, unitPrice: 1400.00, tax: 105.00 },
      { description: "Amalgam Separator Installation (Solmetex NXT)", quantity: 1, unitPrice: 1250.00, tax: 93.75 },
      { description: "Labor - After-Hours (est. 12 hrs)", quantity: 12, unitPrice: 118.00, tax: 0 },
      { description: "EPA Compliance Documentation", quantity: 1, unitPrice: 150.00, tax: 0 },
    ]),
    discount: 0,
    terms: "50% deposit. Balance on completion. After-hours rates included in labor.",
    notes: "Dental office vacuum/air line upgrade and amalgam separator. Job currently on hold pending separator delivery.",
    createdAt: "2026-03-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "est_006",
    estimateNumber: "EST-1020",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_016",
    jobId: null,
    status: "accepted",
    validUntil: "2026-12-31T00:00:00Z",
    lineItems: [
      { description: "Quarterly PM - Hotel 1 (Spring St)", quantity: 4, unitPrice: 1600.00, tax: 0 },
      { description: "Quarterly PM - Hotel 2 (Marietta St)", quantity: 4, unitPrice: 1600.00, tax: 0 },
      { description: "Quarterly PM - Hotel 3 (Luckie St)", quantity: 4, unitPrice: 1600.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Quarterly PM - Hotel 1 (Spring St)", quantity: 4, unitPrice: 1600.00, tax: 0 },
      { description: "Quarterly PM - Hotel 2 (Marietta St)", quantity: 4, unitPrice: 1600.00, tax: 0 },
      { description: "Quarterly PM - Hotel 3 (Luckie St)", quantity: 4, unitPrice: 1600.00, tax: 0 },
    ]),
    discount: 960.00,
    terms: "Annual contract. Billed quarterly in advance. 5% annual discount applied.",
    notes: "2026 annual maintenance contract for all three Castellano hotels. Covers PRV checks, water heater flush, common area fixtures, backflow testing.",
    createdAt: "2025-12-15T10:00:00Z",
    deletedAt: null,
  },
  {
    id: "est_007",
    estimateNumber: "EST-1023",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_021",
    jobId: "job_010",
    status: "accepted",
    validUntil: "2026-03-20T00:00:00Z",
    lineItems: [
      { description: "Shower Drain Relocation", quantity: 1, unitPrice: 1200.00, tax: 90.00 },
      { description: "Dual Vanity Rough-In (Supply & Waste)", quantity: 1, unitPrice: 1450.00, tax: 108.75 },
      { description: "Freestanding Tub Supply Lines", quantity: 1, unitPrice: 850.00, tax: 63.75 },
      { description: "Labor - Phase 2 Rough-In (est. 20 hrs)", quantity: 20, unitPrice: 118.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Shower Drain Relocation", quantity: 1, unitPrice: 1200.00, tax: 90.00 },
      { description: "Dual Vanity Rough-In (Supply & Waste)", quantity: 1, unitPrice: 1450.00, tax: 108.75 },
      { description: "Freestanding Tub Supply Lines", quantity: 1, unitPrice: 850.00, tax: 63.75 },
      { description: "Labor - Phase 2 Rough-In (est. 20 hrs)", quantity: 20, unitPrice: 118.00, tax: 0 },
    ]),
    discount: 0,
    terms: "Due on completion of Phase 2. Phase 3 (finish) estimated separately.",
    notes: "Master bath renovation Phase 2. Follows framing inspection. GC coordinating schedule.",
    createdAt: "2026-03-08T11:00:00Z",
    deletedAt: null,
  },
  {
    id: "est_008",
    estimateNumber: "EST-1018",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_008",
    jobId: null,
    status: "expired",
    validUntil: "2025-09-30T00:00:00Z",
    lineItems: [
      { description: "50-Gal Electric Water Heater (Rheem XE50T10H)", quantity: 1, unitPrice: 980.00, tax: 73.50 },
      { description: "Labor - Installation (est. 3 hrs)", quantity: 3, unitPrice: 95.00, tax: 0 },
      { description: "Haul Away Old Unit", quantity: 1, unitPrice: 75.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "50-Gal Electric Water Heater (Rheem XE50T10H)", quantity: 1, unitPrice: 980.00, tax: 73.50 },
      { description: "Labor - Installation (est. 3 hrs)", quantity: 3, unitPrice: 95.00, tax: 0 },
      { description: "Haul Away Old Unit", quantity: 1, unitPrice: 75.00, tax: 0 },
    ]),
    discount: 0,
    terms: "Payment due on completion.",
    notes: "Client moved out of state before accepting. Estimate expired.",
    createdAt: "2025-08-28T14:00:00Z",
    deletedAt: null,
  },
  {
    id: "est_009",
    estimateNumber: "EST-1026",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_019",
    jobId: "job_005",
    status: "accepted",
    validUntil: "2026-04-30T00:00:00Z",
    lineItems: [
      { description: "Rinnai RU199iN Tankless Water Heater", quantity: 1, unitPrice: 1850.00, tax: 138.75 },
      { description: "Gas Line from Meter", quantity: 1, unitPrice: 580.00, tax: 43.50 },
      { description: "Condensate Drain", quantity: 1, unitPrice: 280.00, tax: 21.00 },
      { description: "Recirculation Loop", quantity: 1, unitPrice: 420.00, tax: 31.50 },
      { description: "Remove & Dispose Existing Tank", quantity: 1, unitPrice: 150.00, tax: 0 },
      { description: "Labor (est. 6.5 hrs)", quantity: 6.5, unitPrice: 118.00, tax: 0 },
      { description: "Permit", quantity: 1, unitPrice: 125.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Rinnai RU199iN Tankless Water Heater", quantity: 1, unitPrice: 1850.00, tax: 138.75 },
      { description: "Gas Line from Meter", quantity: 1, unitPrice: 580.00, tax: 43.50 },
      { description: "Condensate Drain", quantity: 1, unitPrice: 280.00, tax: 21.00 },
      { description: "Recirculation Loop", quantity: 1, unitPrice: 420.00, tax: 31.50 },
      { description: "Remove & Dispose Existing Tank", quantity: 1, unitPrice: 150.00, tax: 0 },
      { description: "Labor (est. 6.5 hrs)", quantity: 6.5, unitPrice: 118.00, tax: 0 },
      { description: "Permit", quantity: 1, unitPrice: 125.00, tax: 0 },
    ]),
    discount: 0,
    terms: "Due on completion. 1-year labor warranty included.",
    notes: "Accepted. Job scheduled for April 14. Materials ordered from Prescott Supply.",
    createdAt: "2026-03-28T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "est_010",
    estimateNumber: "EST-1015",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_005",
    jobId: null,
    status: "declined",
    validUntil: "2025-12-15T00:00:00Z",
    lineItems: [
      { description: "Commercial Drain Cleaning - Main Line", quantity: 1, unitPrice: 650.00, tax: 48.75 },
      { description: "Camera Inspection - Pre & Post", quantity: 2, unitPrice: 275.00, tax: 41.25 },
      { description: "Hydro Jetting - If Required", quantity: 1, unitPrice: 950.00, tax: 71.25 },
    ],
    ...calcTotals([
      { description: "Commercial Drain Cleaning - Main Line", quantity: 1, unitPrice: 650.00, tax: 48.75 },
      { description: "Camera Inspection - Pre & Post", quantity: 2, unitPrice: 275.00, tax: 41.25 },
      { description: "Hydro Jetting - If Required", quantity: 1, unitPrice: 950.00, tax: 71.25 },
    ]),
    discount: 0,
    terms: "Payment due on completion.",
    notes: "Declined. Clearwater handled it internally.",
    createdAt: "2025-11-20T10:00:00Z",
    deletedAt: null,
  },
];
