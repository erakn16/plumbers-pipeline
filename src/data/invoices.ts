export type InvoiceLineItem = {
  lineType?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  taxRate?: number;
  taxNote?: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerPO: string | null;
  serviceAddress: string | null;
  clientId: string;
  jobId: string | null;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxTotal: number;
  discount: number;
  grandTotal: number;
  paymentTerms: string;
  notes: string;
  createdAt: string;
  deletedAt: string | null;
};

function calcTotals(items: InvoiceLineItem[], discount: number = 0): { subtotal: number; taxTotal: number; grandTotal: number } {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxTotal = items.reduce((s, i) => s + i.tax, 0);
  return { subtotal, taxTotal, grandTotal: subtotal + taxTotal - discount };
}

const inv001Items: InvoiceLineItem[] = [
  { description: "50-Gal Gas Water Heater (Bradford White RG250T6N)", quantity: 1, unitPrice: 1450.00, tax: 108.75 },
  { description: "PRV Installation", quantity: 1, unitPrice: 285.00, tax: 21.38 },
  { description: "Expansion Tank", quantity: 1, unitPrice: 175.00, tax: 13.13 },
  { description: "Gas Line Extension - 12ft", quantity: 1, unitPrice: 420.00, tax: 31.50 },
  { description: "Labor - Water Heater Install (6.5 hrs)", quantity: 6.5, unitPrice: 118.00, tax: 0 },
  { description: "Permit Fee", quantity: 1, unitPrice: 85.00, tax: 0 },
];

const inv002Items: InvoiceLineItem[] = [
  { description: "Grease Trap Pumping Service", quantity: 1, unitPrice: 350.00, tax: 26.25 },
  { description: "Baffle Inspection & Cleaning", quantity: 1, unitPrice: 75.00, tax: 5.63 },
  { description: "FOG Compliance Documentation", quantity: 1, unitPrice: 50.00, tax: 0 },
];

const inv003Items: InvoiceLineItem[] = [
  { description: "Emergency Service Call - After Hours", quantity: 1, unitPrice: 195.00, tax: 0 },
  { description: "Copper Supply Line Repair - 4ft Section", quantity: 1, unitPrice: 340.00, tax: 25.50 },
  { description: "Pipe Insulation - Crawl Space (12 linear ft)", quantity: 12, unitPrice: 18.50, tax: 16.65 },
  { description: "Labor - Emergency Repair (4.25 hrs)", quantity: 4.25, unitPrice: 118.00, tax: 0 },
];

const inv004Items: InvoiceLineItem[] = [
  { description: "Sewer Camera Inspection - Full Line", quantity: 1, unitPrice: 275.00, tax: 20.63 },
  { description: "Video Documentation & Report", quantity: 1, unitPrice: 75.00, tax: 0 },
];

const inv005Items: InvoiceLineItem[] = [
  { description: "Hydro Jetting - Main Sewer Line", quantity: 1, unitPrice: 850.00, tax: 63.75 },
  { description: "CIPP Spot Liner - 4ft Section", quantity: 1, unitPrice: 680.00, tax: 51.00 },
  { description: "Camera Inspection - Pre & Post", quantity: 2, unitPrice: 150.00, tax: 22.50 },
  { description: "Labor - Sewer Repair (5 hrs)", quantity: 5, unitPrice: 118.00, tax: 0 },
];

const inv006Items: InvoiceLineItem[] = [
  { description: "Toto Drake Toilet (CT744E)", quantity: 3, unitPrice: 285.00, tax: 64.13 },
  { description: "Wax Ring & Closet Bolts Kit", quantity: 3, unitPrice: 12.50, tax: 2.81 },
  { description: "Labor - Toilet Installation (4.5 hrs)", quantity: 4.5, unitPrice: 95.00, tax: 0 },
];

const inv007Items: InvoiceLineItem[] = [
  { description: "Kitchen Drain Cleaning - Cable Snake", quantity: 1, unitPrice: 165.00, tax: 12.38 },
  { description: "Service Call - Standard", quantity: 1, unitPrice: 0, tax: 0 },
];

const inv008Items: InvoiceLineItem[] = [
  { description: "Supply Line Connector - Braided Stainless", quantity: 2, unitPrice: 24.50, tax: 3.68 },
  { description: "Labor - Hotel Emergency Repair (2.5 hrs)", quantity: 2.5, unitPrice: 118.00, tax: 0 },
  { description: "Service Call - Hotel Contract Rate", quantity: 1, unitPrice: 95.00, tax: 0 },
];

const inv009Items: InvoiceLineItem[] = [
  { description: "Slab Leak Detection - Electronic", quantity: 1, unitPrice: 450.00, tax: 33.75 },
  { description: "Concrete Removal & Replacement", quantity: 1, unitPrice: 1200.00, tax: 90.00 },
  { description: "Copper Supply Line Repair", quantity: 1, unitPrice: 380.00, tax: 28.50 },
  { description: "Labor - Slab Leak Repair (14 hrs)", quantity: 14, unitPrice: 118.00, tax: 0 },
  { description: "Permit Fee", quantity: 1, unitPrice: 125.00, tax: 0 },
];

const inv010Items: InvoiceLineItem[] = [
  { description: "Mainline Sewer Clearing - Weekend Rate", quantity: 1, unitPrice: 225.00, tax: 16.88 },
  { description: "Service Call - Weekend", quantity: 1, unitPrice: 50.00, tax: 0 },
];

const inv011Items: InvoiceLineItem[] = [
  { description: "Residential Backflow Test", quantity: 1, unitPrice: 110.00, tax: 8.25 },
  { description: "Compliance Report Filing", quantity: 1, unitPrice: 20.00, tax: 0 },
];

const inv012Items: InvoiceLineItem[] = [
  { description: "Rough-In Plumbing - Residential Unit (x24)", quantity: 24, unitPrice: 2250.00, tax: 0 },
  { description: "Gas Piping - Per Floor", quantity: 2, unitPrice: 1800.00, tax: 0 },
  { description: "Permit Fees", quantity: 1, unitPrice: 750.00, tax: 0 },
];

const inv013Items: InvoiceLineItem[] = [
  { description: "Grease Trap Pumping Service", quantity: 1, unitPrice: 350.00, tax: 26.25 },
  { description: "Baffle Inspection & Cleaning", quantity: 1, unitPrice: 75.00, tax: 5.63 },
  { description: "FOG Compliance Documentation", quantity: 1, unitPrice: 50.00, tax: 0 },
];

const inv014Items: InvoiceLineItem[] = [
  { description: "Grease Trap Pumping Service", quantity: 1, unitPrice: 325.00, tax: 24.38 },
  { description: "Baffle Inspection & Cleaning", quantity: 1, unitPrice: 60.00, tax: 4.50 },
  { description: "FOG Compliance Documentation", quantity: 1, unitPrice: 40.00, tax: 0 },
];

export const invoices: Invoice[] = [
  {
    id: "inv_001",
    invoiceNumber: "INV-1047",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_003",
    jobId: "job_001",
    status: "paid",
    issueDate: "2026-03-11T00:00:00Z",
    dueDate: "2026-03-25T00:00:00Z",
    paidDate: "2026-03-18T00:00:00Z",
    lineItems: inv001Items,
    ...calcTotals(inv001Items),
    discount: 0,
    paymentTerms: "Net 14",
    notes: "Includes additional gas line extension approved on-site.",
    createdAt: "2026-03-11T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_002",
    invoiceNumber: "INV-1048",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_012",
    jobId: "job_002",
    status: "paid",
    issueDate: "2026-03-18T00:00:00Z",
    dueDate: "2026-04-01T00:00:00Z",
    paidDate: "2026-03-29T00:00:00Z",
    lineItems: inv002Items,
    ...calcTotals(inv002Items),
    discount: 0,
    paymentTerms: "Net 14",
    notes: "Monthly recurring service.",
    createdAt: "2026-03-18T10:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_003",
    invoiceNumber: "INV-1039",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_022",
    jobId: "job_020",
    status: "paid",
    issueDate: "2026-01-19T00:00:00Z",
    dueDate: "2026-02-02T00:00:00Z",
    paidDate: "2026-01-28T00:00:00Z",
    lineItems: inv003Items,
    ...calcTotals(inv003Items),
    discount: 0,
    paymentTerms: "Net 14",
    notes: "Emergency after-hours pipe burst repair.",
    createdAt: "2026-01-19T08:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_004",
    invoiceNumber: "INV-1041",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_013",
    jobId: "job_011",
    status: "paid",
    issueDate: "2026-03-14T00:00:00Z",
    dueDate: "2026-03-28T00:00:00Z",
    paidDate: "2026-03-22T00:00:00Z",
    lineItems: inv004Items,
    ...calcTotals(inv004Items),
    discount: 0,
    paymentTerms: "Net 14",
    notes: "Camera inspection. Video report sent separately.",
    createdAt: "2026-03-14T12:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_005",
    invoiceNumber: "INV-1045",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_002",
    jobId: "job_004",
    status: "paid",
    issueDate: "2026-03-23T00:00:00Z",
    dueDate: "2026-04-22T00:00:00Z",
    paidDate: "2026-04-08T00:00:00Z",
    lineItems: inv005Items,
    ...calcTotals(inv005Items),
    discount: 0,
    paymentTerms: "Net 30",
    notes: "Emergency sewer line repair. Net-30 per standing agreement.",
    createdAt: "2026-03-23T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_006",
    invoiceNumber: "INV-1043",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_018",
    jobId: "job_018",
    status: "paid",
    issueDate: "2026-03-06T00:00:00Z",
    dueDate: "2026-03-20T00:00:00Z",
    paidDate: "2026-03-14T00:00:00Z",
    lineItems: inv006Items,
    ...calcTotals(inv006Items),
    discount: 0,
    paymentTerms: "Net 14",
    notes: "Three toilet installations in strip mall unit.",
    createdAt: "2026-03-06T10:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_007",
    invoiceNumber: "INV-1046",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_006",
    jobId: "job_009",
    status: "paid",
    issueDate: "2026-03-29T00:00:00Z",
    dueDate: "2026-04-05T00:00:00Z",
    paidDate: "2026-04-02T00:00:00Z",
    lineItems: inv007Items,
    ...calcTotals(inv007Items),
    discount: 0,
    paymentTerms: "Due on Receipt",
    notes: "Kitchen drain cleaning. Service call fee waived for repeat customer.",
    createdAt: "2026-03-29T12:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_008",
    invoiceNumber: "INV-1049",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_016",
    jobId: "job_008",
    status: "paid",
    issueDate: "2026-04-02T00:00:00Z",
    dueDate: "2026-05-02T00:00:00Z",
    paidDate: "2026-04-10T00:00:00Z",
    lineItems: inv008Items,
    ...calcTotals(inv008Items),
    discount: 0,
    paymentTerms: "Net 30",
    notes: "Hotel room leak repair. Contract rate applied.",
    createdAt: "2026-04-02T14:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_009",
    invoiceNumber: "INV-1040",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_001",
    jobId: "job_017",
    status: "paid",
    issueDate: "2026-02-16T00:00:00Z",
    dueDate: "2026-03-02T00:00:00Z",
    paidDate: "2026-02-27T00:00:00Z",
    lineItems: inv009Items,
    ...calcTotals(inv009Items),
    discount: 0,
    paymentTerms: "Net 14",
    notes: "Slab leak repair. Additional concrete work charged as discussed on-site.",
    createdAt: "2026-02-16T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_010",
    invoiceNumber: "INV-1044",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_022",
    jobId: "job_022",
    status: "paid",
    issueDate: "2026-03-31T00:00:00Z",
    dueDate: "2026-04-14T00:00:00Z",
    paidDate: "2026-04-07T00:00:00Z",
    lineItems: inv010Items,
    ...calcTotals(inv010Items),
    discount: 0,
    paymentTerms: "Net 14",
    notes: "Weekend overflow service call.",
    createdAt: "2026-03-31T08:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_011",
    invoiceNumber: "INV-1042",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_019",
    jobId: "job_024",
    status: "paid",
    issueDate: "2026-03-08T00:00:00Z",
    dueDate: "2026-03-15T00:00:00Z",
    paidDate: "2026-03-12T00:00:00Z",
    lineItems: inv011Items,
    ...calcTotals(inv011Items),
    discount: 0,
    paymentTerms: "Due on Receipt",
    notes: "Annual backflow test.",
    createdAt: "2026-03-08T10:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_012",
    invoiceNumber: "INV-1038",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_007",
    jobId: "job_025",
    status: "sent",
    issueDate: "2026-03-20T00:00:00Z",
    dueDate: "2026-04-19T00:00:00Z",
    paidDate: null,
    lineItems: inv012Items,
    ...calcTotals(inv012Items),
    discount: 2500.00,
    paymentTerms: "Net 30",
    notes: "Rough-in plumbing for Building A, Floors 1-2. Completed under budget. $2,500 discount applied for early completion.",
    createdAt: "2026-03-20T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_013",
    invoiceNumber: "INV-1050",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_014",
    jobId: "job_003",
    status: "draft",
    issueDate: "",
    dueDate: "",
    paidDate: null,
    lineItems: [
      { description: "Kohler Composed Faucet (K-73050)", quantity: 6, unitPrice: 485.00, tax: 218.25 },
      { description: "Toto Prism Toilet (CT172)", quantity: 4, unitPrice: 420.00, tax: 126.00 },
      { description: "Labor - Fixture Installation (est. 32 hrs)", quantity: 32, unitPrice: 118.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Kohler Composed Faucet (K-73050)", quantity: 6, unitPrice: 485.00, tax: 218.25 },
      { description: "Toto Prism Toilet (CT172)", quantity: 4, unitPrice: 420.00, tax: 126.00 },
      { description: "Labor - Fixture Installation (est. 32 hrs)", quantity: 32, unitPrice: 118.00, tax: 0 },
    ]),
    discount: 0,
    paymentTerms: "Net 30",
    notes: "Draft - awaiting job completion to finalize line items and labor hours.",
    createdAt: "2026-04-09T11:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_014",
    invoiceNumber: "INV-1051",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_002",
    jobId: "job_013",
    status: "draft",
    issueDate: "",
    dueDate: "",
    paidDate: null,
    lineItems: [
      { description: "Water Heater Flush Service (x12 units)", quantity: 12, unitPrice: 165.00, tax: 0 },
      { description: "Anode Rod Inspection (x12 units)", quantity: 12, unitPrice: 35.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Water Heater Flush Service (x12 units)", quantity: 12, unitPrice: 165.00, tax: 0 },
      { description: "Anode Rod Inspection (x12 units)", quantity: 12, unitPrice: 35.00, tax: 0 },
    ]),
    discount: 0,
    paymentTerms: "Net 30",
    notes: "Draft for upcoming annual flush service. Pending scheduling.",
    createdAt: "2026-04-07T10:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_015",
    invoiceNumber: "INV-1036",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_012",
    jobId: "job_023",
    status: "paid",
    issueDate: "2026-02-15T00:00:00Z",
    dueDate: "2026-03-01T00:00:00Z",
    paidDate: "2026-02-25T00:00:00Z",
    lineItems: inv013Items,
    ...calcTotals(inv013Items),
    discount: 0,
    paymentTerms: "Net 14",
    notes: "February grease trap service.",
    createdAt: "2026-02-15T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_016",
    invoiceNumber: "INV-1037",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_025",
    jobId: null,
    status: "overdue",
    issueDate: "2026-03-10T00:00:00Z",
    dueDate: "2026-03-24T00:00:00Z",
    paidDate: null,
    lineItems: inv014Items,
    ...calcTotals(inv014Items),
    discount: 0,
    paymentTerms: "Net 14",
    notes: "March grease trap service. Payment reminder sent April 1.",
    createdAt: "2026-03-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_017",
    invoiceNumber: "INV-1052",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_023",
    jobId: "job_014",
    status: "draft",
    issueDate: "",
    dueDate: "",
    paidDate: null,
    lineItems: [
      { description: "Sloan Royal Flush Valve", quantity: 2, unitPrice: 145.00, tax: 21.75 },
      { description: "American Standard Toilet", quantity: 1, unitPrice: 210.00, tax: 15.75 },
      { description: "Faucet Cartridge Replacement", quantity: 1, unitPrice: 45.00, tax: 3.38 },
      { description: "Labor - Restroom Repair (est. 3.5 hrs)", quantity: 3.5, unitPrice: 95.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Sloan Royal Flush Valve", quantity: 2, unitPrice: 145.00, tax: 21.75 },
      { description: "American Standard Toilet", quantity: 1, unitPrice: 210.00, tax: 15.75 },
      { description: "Faucet Cartridge Replacement", quantity: 1, unitPrice: 45.00, tax: 3.38 },
      { description: "Labor - Restroom Repair (est. 3.5 hrs)", quantity: 3.5, unitPrice: 95.00, tax: 0 },
    ]),
    discount: 0,
    paymentTerms: "Net 30",
    notes: "Draft for school restroom repairs. Pending job completion.",
    createdAt: "2026-04-11T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_018",
    invoiceNumber: "INV-1053",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_011",
    jobId: "job_007",
    status: "sent",
    issueDate: "2026-04-10T00:00:00Z",
    dueDate: "2026-04-24T00:00:00Z",
    paidDate: null,
    lineItems: [
      { description: "Backflow Preventer Testing (x28 units)", quantity: 28, unitPrice: 110.00, tax: 0 },
      { description: "Compliance Report Filing (x28)", quantity: 28, unitPrice: 20.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Backflow Preventer Testing (x28 units)", quantity: 28, unitPrice: 110.00, tax: 0 },
      { description: "Compliance Report Filing (x28)", quantity: 28, unitPrice: 20.00, tax: 0 },
    ]),
    discount: 0,
    paymentTerms: "Net 14",
    notes: "Quarterly backflow testing. Pre-invoiced before scheduled service date.",
    createdAt: "2026-04-10T14:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_019",
    invoiceNumber: "INV-1054",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_016",
    jobId: "job_016",
    status: "sent",
    issueDate: "2026-04-11T00:00:00Z",
    dueDate: "2026-05-11T00:00:00Z",
    paidDate: null,
    lineItems: [
      { description: "Quarterly PM - Hotel 1 (Spring St)", quantity: 1, unitPrice: 1600.00, tax: 0 },
      { description: "Quarterly PM - Hotel 2 (Marietta St)", quantity: 1, unitPrice: 1600.00, tax: 0 },
      { description: "Quarterly PM - Hotel 3 (Luckie St)", quantity: 1, unitPrice: 1600.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Quarterly PM - Hotel 1 (Spring St)", quantity: 1, unitPrice: 1600.00, tax: 0 },
      { description: "Quarterly PM - Hotel 2 (Marietta St)", quantity: 1, unitPrice: 1600.00, tax: 0 },
      { description: "Quarterly PM - Hotel 3 (Luckie St)", quantity: 1, unitPrice: 1600.00, tax: 0 },
    ]),
    discount: 0,
    paymentTerms: "Net 30",
    notes: "Q2 quarterly maintenance. Pre-invoiced pending schedule confirmation.",
    createdAt: "2026-04-11T08:00:00Z",
    deletedAt: null,
  },
  {
    id: "inv_020",
    invoiceNumber: "INV-1035",
    customerPO: null,
    serviceAddress: null,
    clientId: "cli_001",
    jobId: null,
    status: "paid",
    issueDate: "2026-01-15T00:00:00Z",
    dueDate: "2026-01-29T00:00:00Z",
    paidDate: "2026-01-25T00:00:00Z",
    lineItems: [
      { description: "Annual Backflow Test - Unit 3", quantity: 1, unitPrice: 110.00, tax: 8.25 },
      { description: "Annual Backflow Test - Unit 7", quantity: 1, unitPrice: 110.00, tax: 8.25 },
      { description: "Annual Backflow Test - Unit 11", quantity: 1, unitPrice: 110.00, tax: 8.25 },
      { description: "Compliance Report Filing (x3)", quantity: 3, unitPrice: 20.00, tax: 0 },
    ],
    ...calcTotals([
      { description: "Annual Backflow Test - Unit 3", quantity: 1, unitPrice: 110.00, tax: 8.25 },
      { description: "Annual Backflow Test - Unit 7", quantity: 1, unitPrice: 110.00, tax: 8.25 },
      { description: "Annual Backflow Test - Unit 11", quantity: 1, unitPrice: 110.00, tax: 8.25 },
      { description: "Compliance Report Filing (x3)", quantity: 3, unitPrice: 20.00, tax: 0 },
    ]),
    discount: 0,
    paymentTerms: "Net 14",
    notes: "Annual backflow testing for three Delgado units.",
    createdAt: "2026-01-15T10:00:00Z",
    deletedAt: null,
  },
];
