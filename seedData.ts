


import type { Project, CompanySettings, Contact } from './types';
import { Unit, Confidence, ExpenseCategory, IncidentHazard, IncidentContributingCondition, IncidentContributingBehavior } from './types';

export const sampleCompanySettings: CompanySettings = {
    name: 'Apex Construction Group',
    address: '123 Builder Lane\nConstructville, ST 54321',
    phone: '555-123-4567',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsPSIjRkZEMTAwIiBkPSJNNTAsMi41QTE1LDE1LDAsMCwxLDY1LDE3LjVWODAuNmwtMTUsOC43LTE1LTguN1YxNy41QTE1LDE1LDAsMCwxLDUwLDIuNVoiLz48cGF0aCBmaWxsPSIjRkZBNTAwIiBkPSJNNTAsMi41Vjg5LjNsLTE1LTguN1YxNy41QTE1LDE1LDAsMCwxLDUwLDIuNVoiLz48cGF0aCBmaWxsPSIjMzMzMzMzIiBkPSJNNTAsMTJBNi41LDYuNSwwLDAsMCw0My41LDE4LjV2NTlsMTMsNy41di03NC41QTYuNSw2LjUsMCwwLDAsNTAsMTJaIi8+PHBhdGggZmlsbD0iIzY2NjY2NiIgZD0iTTUwLDEyVjg1di03My4xQTYuNSw2LjUsMCwwLDAsNTAsMTJaIi8+PC9zdmc+',
};

export const sampleCrmContacts: Contact[] = [
    { id: 'contact-sample-1', name: 'Sarah Chen', company: 'Innovate Corp.', role: 'Client, Project Lead', email: 'sarah.chen@innovate.com', phone: '555-321-7654', billableRate: 0 },
    { id: 'contact-sample-2', name: 'David Lee', company: 'Studio Design Architects', role: 'Lead Architect', email: 'd.lee@studiodesign.com', phone: '555-987-1234', billableRate: 175 },
    { id: 'contact-sample-3', name: 'Mike Rodriguez', company: 'Power Electric', role: 'Electrical Subcontractor', email: 'mike@powerelectric.net', phone: '555-456-7890', billableRate: 95 },
    { id: 'contact-sample-4', name: 'John Carter', company: 'Metro City Inspections', role: 'Building Inspector', email: 'jcarter@cityinspections.gov', phone: '555-222-3333', billableRate: 0 },
    { id: 'contact-sample-5', name: 'Emily White', company: 'FlowRight Plumbing', role: 'Plumbing Subcontractor', email: 'emily.w@flowright.com', phone: '555-888-9999', billableRate: 85 },
];

const getISODateString = (offsetDays: number = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().split('T')[0];
};


export const sampleProject: Project = {
    id: 'proj-sample-123',
    name: 'Midtown Office Renovation',
    address: '456 Commerce St, Suite 300, Metro City',
    clientName: 'Innovate Corp.',
    activeTool: 'dashboard',
    usesScheduleOfValues: true,
    contactIds: ['contact-sample-1', 'contact-sample-2', 'contact-sample-3', 'contact-sample-5'],
    estimator: {
        processedPlanText: 'Extracted text from A101-Architectural.pdf\n\nSection 03 30 00 - Cast-in-Place Concrete: Concrete shall have a minimum compressive strength of 4000 PSI at 28 days. Section 31 20 00 - Earth Moving: All structural sub-grade fill shall be compacted to a minimum of 95% of the maximum dry density as determined by ASTM D1557 (Modified Proctor).',
        stagedRfis: [],
        apiResponse: {
            estimate_json: {
                project_id: 'proj-sample-123',
                scope_summary: 'Interior fit-out for a 3,500 sq ft office space, including new partitions, electrical, plumbing, and finishes for open-plan areas, private offices, and a kitchenette.',
                assumptions: [
                    'All work to be performed during standard business hours.',
                    'Existing HVAC system to be reused with minor ductwork modifications.',
                    'Client-provided appliances for the kitchenette.',
                ],
                line_items: [
                    { item: 'Demolition of existing non-load-bearing walls', unit: Unit.SquareFoot, qty: 800, confidence: Confidence.High, notes: 'Includes disposal of debris.' },
                    { item: 'Metal stud framing for new partitions', unit: Unit.LinearFoot, qty: 450, confidence: Confidence.High, notes: '16" on center, standard gauge.' },
                    { item: '5/8" Type X Gypsum Wall Board installation', unit: Unit.SquareFoot, qty: 7200, confidence: Confidence.Medium, notes: 'Both sides of new walls. Includes taping and finishing to Level 4.' },
                    { item: 'Install new 2x4 suspended acoustical ceiling', unit: Unit.SquareFoot, qty: 3500, confidence: Confidence.High, notes: 'Standard grid and tiles.' },
                    { item: 'Install 20A duplex receptacles', unit: Unit.Each, qty: 45, confidence: Confidence.High, notes: 'Locations per electrical plan E-1.' },
                    { item: 'Install 2x4 LED lay-in light fixtures', unit: Unit.Each, qty: 60, confidence: Confidence.High, notes: 'Includes wiring and connections.' },
                    { item: 'Rough-in plumbing for kitchenette sink', unit: Unit.LumpSum, qty: 1, confidence: Confidence.High, notes: 'Includes water lines and P-trap.' },
                    { item: 'Interior painting (2 coats)', unit: Unit.SquareFoot, qty: 8500, confidence: Confidence.Medium, notes: 'Wall surface area. Paint color TBD by client.' },
                ],
                exclusions: [
                    'Data/telecom cabling.',
                    'Office furniture and workstations.',
                    'Window treatments.',
                    'Permit fees.',
                ]
            },
            proposal_text: `PROPOSAL FOR: Midtown Office Renovation\n\nApex Construction Group is pleased to submit this proposal for the interior fit-out of the 3,500 sq ft office space located at 456 Commerce St.\n\nSCOPE OF WORK:\n- Demolition of existing partitions.\n- Installation of new metal stud framing and drywall.\n- Installation of new suspended ceilings and LED lighting.\n- Electrical rough-in for new outlets and fixtures.\n- Plumbing for new kitchenette.\n- Interior painting.\n\nEXCLUSIONS:\n- Data/telecom cabling.\n- Office furniture and window treatments.\n\nASSUMPTIONS:\n- Work to be performed during standard business hours.\n- Existing HVAC system is adequate and will be reused.\n\nThank you for the opportunity to bid on this project.`,
            bid_reply_email: `Subject: Bid for Midtown Office Renovation\n\nHi Innovate Corp. Team,\n\nThank you for the opportunity. Please find our attached proposal for the Midtown Office Renovation project.\n\nWe have identified a few items that require clarification (see attached RFIs). Specifically, we need the specification for the new LVT flooring and confirmation on the fire rating requirements for the server room walls.\n\nPlease review our proposal and let us know if you have any questions.\n\nBest,\n\nThe Apex Construction Team`,
            rfi_list: [
                { subject: 'LVT Flooring Specification', question: 'The finish schedule on A-401 calls for "LVT flooring" in the main office area but does not provide a manufacturer, model, or color. Please provide the specification.' },
                { subject: 'Server Room Wall Fire Rating', question: 'The plans do not specify a fire rating for the new walls surrounding the server room. Please confirm if a specific fire rating (e.g., 1-hour) is required.' },
            ],
        }
    },
    rfiManager: {
        managedRfis: [
            { id: 'rfi-sample-1', subject: 'LVT Flooring Specification', question: 'The finish schedule on A-401 calls for "LVT flooring" in the main office area but does not provide a manufacturer, model, or color. Please provide the specification.', status: 'Answered', answer: 'Please use "Tarkett SureStep LVT, Color: Oak Natural".', analysis: 'Scope: No change. Cost: Potential impact based on material cost difference from allowance. Schedule: No impact.', log: [{timestamp: new Date().toISOString(), note: 'Email sent to architect.'}] },
            { id: 'rfi-sample-2', subject: 'Server Room Wall Fire Rating', question: 'The plans do not specify a fire rating for the new walls surrounding the server room. Please confirm if a specific fire rating (e.g., 1-hour) is required.', status: 'Sent', answer: '', analysis: '', log: [] },
            { id: 'rfi-sample-3', subject: 'Conference Room Glass Type', question: 'What type of glass should be used for the conference room sidelights?', status: 'Draft', answer: '', analysis: '', log: [] },
        ]
    },
    inspections: [
        { id: 'insp-sample-3', inspectionNumber: 3, type: 'Framing Re-inspection', recipientName: 'John Carter', recipientEmail: 'jcarter@cityinspections.gov', requestedDate: '2024-08-10', status: 'Open', relatedInspectionId: '2', isSigned: false, auditLog: [{ timestamp: new Date().toISOString(), user: 'PM', action: 'Created follow-up inspection.' }] },
        { id: 'insp-sample-2', inspectionNumber: 2, type: 'Framing Inspection', recipientName: 'John Carter', recipientEmail: 'jcarter@cityinspections.gov', requestedDate: '2024-08-05', scheduledDate: '2024-08-06', status: 'Failed', outcomeNotes: 'Header over conference room door is undersized. Does not match structural drawings. Needs to be replaced.', isSigned: true, signedBy: 'John Carter', signedAt: new Date(Date.now() - 86400000 * 2).toISOString(), driveFileId: 'drive-sample-insp-2', auditLog: [{ timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), user: 'PM', action: 'Created request.' }, { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), user: 'John Carter', action: 'Signed and finalized with status: Failed.' }] },
        { id: 'insp-sample-1', inspectionNumber: 1, type: 'Plumbing Rough-in', recipientName: 'John Carter', recipientEmail: 'jcarter@cityinspections.gov', requestedDate: '2024-08-01', scheduledDate: '2024-08-02', status: 'Passed', isSigned: true, signedBy: 'John Carter', signedAt: new Date(Date.now() - 86400000 * 4).toISOString(), driveFileId: 'drive-sample-insp-1', auditLog: [{ timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), user: 'PM', action: 'Created request.' }, { timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), user: 'John Carter', action: 'Signed and finalized with status: Passed.' }] },
    ],
    dailyLogs: [
        { id: 'log-sample-1', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], notes: 'Framing crew onsite. Completed rework of conference room header. All other areas cleared for drywall. Awaiting re-inspection tomorrow.', status: 'Signed', signedBy: 'Project Manager', signedAt: new Date(Date.now() - 86400000).toISOString(), driveFileId: 'drive-sample-log-1' },
        { id: 'log-sample-2', date: new Date().toISOString().split('T')[0], notes: 'Electrical subcontractor (Power Electric) onsite, continuing with pulling wire to all receptacle locations.', status: 'Draft' },
    ],
    email: [
        { id: 'email-sample-1', from: 'Sarah Chen (Innovate Corp.)', subject: 'Question about paint colors', body: 'Hi Team, Do you have the final date you need our paint color selections by? We are still deciding between a few options. Thanks, Sarah', timestamp: new Date(Date.now() - 86400000).toISOString(), read: false },
        { id: 'email-sample-2', from: 'Mike - Power Electric', subject: 'Light Fixture Delivery', body: 'Just confirming that the LED fixtures are scheduled for delivery to the site this Friday, 8/9. Let me know if there are any issues with site access. -Mike', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true },
        { id: 'email-sample-3', from: 'Building Management', subject: 'REMINDER: Freight Elevator Maintenance', body: 'This is a reminder that the freight elevator will be out of service for scheduled maintenance on Monday, 8/12, from 8 AM to 12 PM. Please plan your deliveries accordingly.', timestamp: new Date(Date.now() - 259200000).toISOString(), read: true },
    ],
    drive: [
        { id: 'folder-1', name: 'Daily Logs', type: 'folder', size: 0, folderPath: '/', isLocked: true },
        { id: 'folder-2', name: 'Inspections', type: 'folder', size: 0, folderPath: '/', isLocked: true },
        { id: 'folder-3', name: 'Closeout', type: 'folder', size: 0, folderPath: '/', isLocked: false },
        { id: 'folder-4', name: 'Photos', type: 'folder', size: 0, folderPath: '/', isLocked: false },
        { id: 'folder-5', name: 'Receipts', type: 'folder', size: 0, folderPath: '/', isLocked: false },
        { id: 'drive-sample-log-1', name: `Daily-Log-2024-08-20.txt`, type: 'text/plain', size: 512, folderPath: '/Daily Logs/', isLocked: true },
        { id: 'drive-sample-insp-1', name: 'Inspection-001-Plumbing-Rough-in.txt', type: 'text/plain', size: 480, folderPath: '/Inspections/', isLocked: true },
        { id: 'drive-sample-insp-2', name: 'Inspection-002-Framing.txt', type: 'text/plain', size: 620, folderPath: '/Inspections/', isLocked: true },
        { id: 'drive-sample-1', name: 'A101-Architectural.pdf', type: 'application/pdf', size: 2345678, folderPath: '/', isLocked: false },
        { id: 'drive-sample-2', name: 'E1-Electrical-Plan.pdf', type: 'application/pdf', size: 1123456, folderPath: '/', isLocked: false },
        { 
            id: 'drive-sample-3', 
            name: 'Site-Photo-2024-08-01.jpg', 
            type: 'image/jpeg', 
            size: 4567890, 
            folderPath: '/Photos/', 
            isLocked: false,
            caption: 'Initial plumbing rough-in completed in the main core area ahead of the first inspection.',
            annotationMethod: 'manual'
        },
        { id: 'drive-sample-closeout-1', name: 'Warranty - HVAC System.pdf', type: 'application/pdf', size: 345123, folderPath: '/Closeout/', isLocked: true },
        { id: 'drive-sample-closeout-2', name: 'As-Built Drawings - Architectural.pdf', type: 'application/pdf', size: 5123456, folderPath: '/Closeout/', isLocked: true },
        { id: 'drive-sample-closeout-3', name: 'Final Building Permit.pdf', type: 'application/pdf', size: 123456, folderPath: '/Closeout/', isLocked: true },
        { id: 'drive-sample-closeout-4', name: 'Kitchen Appliance Manuals.pdf', type: 'application/pdf', size: 2345678, folderPath: '/Closeout/', isLocked: false },
        { id: 'drive-sample-geotech-1', name: 'Geotech-Report-XYZ.pdf', type: 'application/pdf', size: 275432, folderPath: '/Inspections/', isLocked: false },
        { id: 'drive-receipt-1', name: 'receipt-homedepot.jpg', type: 'image/jpeg', size: 12345, folderPath: '/Receipts/', isLocked: false },
    ],
    invoicing: {
        projectName: 'Midtown Office Renovation',
        applicationNumber: 2,
        periodTo: '2024-08-31',
        architectsProjectNumber: 'IC-2024-01',
        lineItems: [
            { id: 'li-1', itemNumber: '100', description: 'General Conditions', scheduledValue: 25000, prevBilled: 10000, thisPeriod: 5000, storedMaterials: 0 },
            { id: 'li-2', itemNumber: '200', description: 'Demolition', scheduledValue: 15000, prevBilled: 15000, thisPeriod: 0, storedMaterials: 0 },
            { id: 'li-3', itemNumber: '300', description: 'Framing & Drywall', scheduledValue: 75000, prevBilled: 20000, thisPeriod: 35000, storedMaterials: 0 },
            { id: 'li-4', itemNumber: '400', description: 'Electrical', scheduledValue: 60000, prevBilled: 10000, thisPeriod: 15000, storedMaterials: 10000 },
            { id: 'li-exp-2', itemNumber: 'EXP-01', description: 'Reimbursable Expense: Sunbelt Rentals - Scissor lift rental for high ceiling work.', scheduledValue: 0, prevBilled: 450, thisPeriod: 0, storedMaterials: 0, sourceExpenseId: 'exp-sample-2' },
            { id: 'li-time-1', itemNumber: 'LAB-01', description: 'Labor: Emily White - Plumbing Rough-in', scheduledValue: 0, prevBilled: 0, thisPeriod: 1275, storedMaterials: 0, sourceTimeEntryIds: ['te-3'], originalThisPeriodAmount: 1360, }, // 16h * 85 = 1360. Discounted to 1275.
        ],
        changeOrders: [
            { id: 'co-1', description: 'Add 2 outlets in CEO office', value: 950 },
        ],
        retainagePercentage: 10,
        materialsRetainagePercentage: 0,
        previousPayments: 43200,
    },
    riskManagement: {
        risks: [
            { id: 'risk-1', description: 'Failed framing inspection for undersized header requires immediate rework, causing potential schedule delays and cost overruns.', category: 'Quality', severity: 'High', mitigationPlan: 'Notify architect of deficiency, draft change order for corrective work, and schedule re-inspection.', status: 'Accepted', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updates: [
                { meetingId: 'meeting-1', timestamp: new Date().toISOString(), updateText: 'Framing sub notified. Change order being drafted for rework. Re-inspection scheduled.', status: 'In Progress' }
            ]},
            { id: 'risk-2', description: 'Client has not provided paint color selections, which could delay the start of finishing work.', category: 'Schedule', severity: 'Medium', mitigationPlan: 'Send a follow-up email to the client to get a decision by a firm deadline.', status: 'Accepted', createdAt: new Date().toISOString(), updates: [
                { meetingId: 'meeting-1', timestamp: new Date().toISOString(), updateText: 'Follow-up email sent to client. Deadline of this Friday communicated.', status: 'In Progress' }
            ]},
            { id: 'risk-3', description: 'Freight elevator maintenance conflicts with a major material delivery, potentially causing a one-day delay.', category: 'Schedule', severity: 'Low', mitigationPlan: 'Coordinate with the supplier to reschedule the delivery for the following day.', status: 'Closed', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updates: [
                 { meetingId: 'meeting-1', timestamp: new Date().toISOString(), updateText: 'Delivery rescheduled with supplier for the following day. Issue resolved.', status: 'Closed' }
            ]},
            { id: 'risk-4', description: 'An open RFI about server room fire rating could cause rework if construction proceeds with incorrect specifications.', category: 'Budget', severity: 'Medium', mitigationPlan: 'Follow up with the architect and emphasize the need for a response to avoid potential delays.', status: 'Rejected', createdAt: new Date().toISOString(), updates: []},
        ],
        meetings: [
            { id: 'meeting-1', date: new Date(Date.now() - 86400000).toISOString(), title: 'Weekly Sync - Week 5', attendees: ['PM', 'Sarah Chen', 'Mike Rodriguez']}
        ]
    },
    clientUpdates: [
        {
            id: 'update-1',
            title: 'Project Update: Week of August 5th',
            summary: 'We passed our plumbing inspection and addressed a framing issue, keeping the project moving forward.',
            publicationDate: new Date(Date.now() - 86400000 * 3).toISOString(),
            status: 'Published',
            sections: [
                {
                    id: 'sec-1-1',
                    heading: 'Key Milestones This Week',
                    content: 'A major highlight this week was passing our plumbing rough-in inspection on the first attempt! This is a significant step and allows us to begin closing up walls in the core areas.\n\nOur electrical team has also been making fantastic progress, completing the rough-in for all the private offices on the north side of the floor.',
                    imageUrls: [],
                },
                {
                    id: 'sec-1-2',
                    heading: 'Framing Inspection Update',
                    content: "Transparency is important to us, so we want to let you know that the city's framing inspection identified an incorrect header size over the main conference room door. This is a straightforward fix, and we have already coordinated with the architect and ordered the correct materials. We've adjusted our schedule to perform this rework without impacting the critical path for the overall project completion.",
                    imageUrls: [],
                },
                {
                    id: 'sec-1-3',
                    heading: 'Looking Ahead',
                    content: "- Complete framing rework\n- Schedule framing re-inspection\n- Begin drywall installation in bathrooms and core areas",
                    imageUrls: [],
                }
            ]
        }
    ],
    testingAndQuality: [
        {
            id: 'test-sample-1',
            name: 'Concrete Cylinder Compression Test (7-day)',
            date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
            location: 'Foundation Footing, Grid A-1',
            requiredSpec: '> 3000 PSI',
            actualResult: '3450 PSI',
            status: 'Pass',
            notes: 'Manually logged by site supervisor.',
        },
        {
            id: 'test-sample-2',
            name: 'Field Density Test',
            date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
            location: 'Sub-grade, Area B',
            requiredSpec: '95% Modified Proctor',
            actualResult: '93.8%',
            status: 'Fail',
            notes: 'Failed compaction test. Rework and re-testing required. See report for details.',
            sourceDocumentId: 'drive-sample-geotech-1',
        },
    ],
    expenses: [
        {
            id: 'exp-sample-1',
            date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
            vendor: 'Home Depot',
            amount: 284.55,
            category: ExpenseCategory.Supplies,
            description: 'Additional drywall screws and corner bead.',
            invoicable: true,
            status: 'Pending',
            sourceReceiptId: 'drive-receipt-1',
        },
        {
            id: 'exp-sample-2',
            date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
            vendor: 'Sunbelt Rentals',
            amount: 450.00,
            category: ExpenseCategory.EquipmentRental,
            description: 'Scissor lift rental for high ceiling work.',
            invoicable: true,
            status: 'Invoiced',
            sourceReceiptId: 'drive-receipt-2',
        },
        {
            id: 'exp-sample-3',
            date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
            vendor: 'Luigi\'s Pizza',
            amount: 75.20,
            category: ExpenseCategory.Meals,
            description: 'Lunch for the crew.',
            invoicable: false,
            status: 'Pending',
            sourceReceiptId: 'drive-receipt-3',
        }
    ],
    submittals: [
        {
            id: 'sub-sample-1',
            number: '05 12 00-1',
            revision: 0,
            title: 'Structural Steel Shop Drawings',
            status: 'Pending',
            submittalManagerId: 'contact-sample-2', // David Lee
            specSection: '05 12 00',
            submittalType: 'Shop Drawing',
            responsibleContractorId: 'contact-sample-3', // Mike Rodriguez - placeholder
            issueDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
            requiredOnSiteDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
            leadTime: 21,
            designTeamReviewTime: 10,
            internalReviewTime: 2,
            private: false,
            distributionListIds: ['contact-sample-1', 'contact-sample-2'],
            workflow: [
                { id: 'wf-1', stepNumber: 1, contactId: 'contact-sample-2', role: 'Approver', daysToRespond: 10 }
            ],
            attachments: [],
        }
    ],
    incidents: [
        {
            id: 'inc-sample-1',
            title: 'Minor slip on wet floor near entrance',
            eventDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
            eventTime: '09:30',
            isTimeUnknown: false,
            location: 'Main Entrance - Lobby',
            isRecordable: false,
            isPrivate: false,
            description: 'Foreman slipped on a small puddle of water just inside the main entrance. No injury sustained. Water was cleaned up and "Wet Floor" sign was placed.',
            distributionIds: ['contact-sample-1', 'contact-sample-2'],
            attachments: [],
            hazard: IncidentHazard.FallOrSlip,
            contributingCondition: IncidentContributingCondition.PoorHousekeeping,
            contributingBehavior: IncidentContributingBehavior.Inattention,
        }
    ],
    customReports: [],
    timeEntries: [
        // Mike Rodriguez's Time (Pending)
        { id: 'te-1', employeeId: 'contact-sample-3', date: getISODateString(-3), hours: 8, costCode: '26-Electrical', description: 'Pulled wire for office receptacles.', status: 'Pending', location: { latitude: 34.0522, longitude: -118.2437 }, locationTimestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: 'te-2', employeeId: 'contact-sample-3', date: getISODateString(-2), hours: 8, costCode: '26-Electrical', description: 'Landed circuits in panel.', status: 'Pending', location: { latitude: 34.0525, longitude: -118.2440 }, locationTimestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
        // Emily White's Time (Approved, then Invoiced with adjustment)
        { id: 'te-3', employeeId: 'contact-sample-5', date: getISODateString(-10), hours: 16, costCode: '22-Plumbing', description: 'Completed all rough-in for kitchenette.', status: 'Invoiced', invoiceId: 'inv-1', location: { latitude: 34.0519, longitude: -118.2430 }, locationTimestamp: new Date(Date.now() - 86400000 * 10).toISOString() },
        // Emily White's Time (Draft)
        { id: 'te-4', employeeId: 'contact-sample-5', date: getISODateString(-1), hours: 4, costCode: '22-Plumbing', description: 'Set fixtures in restrooms.', status: 'Draft', location: { latitude: 34.0528, longitude: -118.2435 }, locationTimestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
};