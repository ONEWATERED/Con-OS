
import React, { useMemo } from 'react';
import type { Project, Contact, AppTool, Email, DriveFile } from '../types';

interface ProjectDashboardProps {
  project: Project;
  allContacts: Contact[];
  setActiveTool: (tool: AppTool) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
  colorClass: string;
}> = ({ title, value, icon, onClick, colorClass }) => (
  <div
    onClick={onClick}
    className={`bg-card p-4 rounded-xl shadow-sm border border-border flex items-start justify-between ${onClick ? 'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-1' : ''}`}
  >
    <div>
      <p className="text-sm font-semibold text-text-muted">{title}</p>
      <p className="text-3xl font-bold text-text-default mt-1">{value}</p>
    </div>
    <div className={`p-2 rounded-lg ${colorClass}`}>{icon}</div>
  </div>
);

type RecentActivity = 
    | { type: 'email'; item: Email; timestamp: Date }
    | { type: 'file'; item: DriveFile; timestamp: Date };

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project, allContacts, setActiveTool }) => {

  const metrics = useMemo(() => {
    const unreadEmails = project.email.filter(e => !e.read).length;
    const openRfis = project.rfiManager.managedRfis.filter(rfi => rfi.status === 'Sent' || rfi.status === 'Draft').length;
    const pendingInspections = project.inspections.filter(i => i.status === 'Open' || i.status === 'Scheduled').length;
    const failedInspections = project.inspections.filter(i => i.status === 'Failed');
    const changeOrderTotal = project.invoicing.changeOrders.reduce((acc, co) => acc + co.value, 0);

    const originalContractSum = project.invoicing.lineItems.reduce((acc, item) => acc + item.scheduledValue, 0);
    const contractSumToDate = originalContractSum + changeOrderTotal;
    const totalBilled = project.invoicing.lineItems.reduce((acc, item) => acc + item.prevBilled + item.thisPeriod, 0);
    const balanceToFinish = contractSumToDate - totalBilled;
    
    const billedTimeAdjustments = project.invoicing.lineItems.reduce((acc, item) => {
        if (item.sourceTimeEntryIds && typeof item.originalThisPeriodAmount === 'number') {
            return acc + (item.thisPeriod - item.originalThisPeriodAmount);
        }
        return acc;
    }, 0);

    const projectContacts = allContacts.filter(contact => project.contactIds.includes(contact.id));
    
    const recentActivity: RecentActivity[] = [
        ...project.email.filter(e => !e.read).map(e => ({ type: 'email' as const, item: e, timestamp: new Date(e.timestamp) })),
        ...project.drive.map(f => ({ type: 'file' as const, item: f, timestamp: new Date(parseInt(f.id.split('-')[1])) })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);


    return {
      unreadEmails,
      openRfis,
      pendingInspections,
      failedInspections,
      changeOrderTotal,
      originalContractSum,
      contractSumToDate,
      balanceToFinish,
      billedTimeAdjustments,
      projectContacts,
      recentActivity,
    };
  }, [project, allContacts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-text-default">{project.name}</h2>
        <p className="text-text-muted">{project.address}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Unread Emails"
          value={metrics.unreadEmails}
          onClick={() => setActiveTool('email')}
          colorClass="bg-blue-100"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          title="Open RFIs"
          value={metrics.openRfis}
          onClick={() => setActiveTool('rfiManager')}
          colorClass="bg-orange-100"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="Pending Inspections"
          value={metrics.pendingInspections}
          onClick={() => setActiveTool('inspections')}
          colorClass="bg-yellow-100"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
        />
        <StatCard
          title="Billed Time Adjustments"
          value={formatCurrency(metrics.billedTimeAdjustments)}
          colorClass={metrics.billedTimeAdjustments < 0 ? "bg-red-100" : "bg-gray-100"}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${metrics.billedTimeAdjustments < 0 ? "text-red-600" : "text-gray-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-card p-5 rounded-xl shadow-sm border border-border">
                <h3 className="font-semibold text-text-default mb-3">Financial Summary</h3>
                <div className="grid grid-cols-3 divide-x divide-border">
                    <div className="text-center px-2">
                        <p className="text-sm text-text-muted">Original Contract</p>
                        <p className="text-2xl font-bold text-text-default mt-1">{formatCurrency(metrics.originalContractSum)}</p>
                    </div>
                    <div className="text-center px-2">
                        <p className="text-sm text-text-muted">Contract To-Date</p>
                        <p className="text-2xl font-bold text-text-default mt-1">{formatCurrency(metrics.contractSumToDate)}</p>
                    </div>
                     <div className="text-center px-2">
                        <p className="text-sm text-text-muted">Balance to Finish</p>
                        <p className="text-2xl font-bold text-text-default mt-1">{formatCurrency(metrics.balanceToFinish)}</p>
                    </div>
                </div>
            </div>
            
             {metrics.failedInspections.length > 0 && (
                <div className="bg-red-50 p-5 rounded-xl border border-red-200">
                    <div className="flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <h3 className="font-semibold text-red-800">At-Risk: Failed Inspections</h3>
                    </div>
                    <ul className="mt-3 space-y-2">
                        {metrics.failedInspections.map(insp => (
                            <li key={insp.id} className="text-sm text-red-700 bg-red-100 p-2 rounded-md">
                                <span className="font-semibold">{insp.type}</span>: {insp.outcomeNotes}
                            </li>
                        ))}
                    </ul>
                </div>
             )}
            
             <div className="bg-card p-5 rounded-xl shadow-sm border border-border">
                <h3 className="font-semibold text-text-default mb-3">Recent Activity</h3>
                <ul className="divide-y divide-border">
                    {metrics.recentActivity.map((activity) => (
                        <li key={activity.item.id} className="py-3 flex items-center space-x-3">
                            {activity.type === 'email' && (
                                <>
                                    <div className="p-2 bg-blue-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                                    <div className="text-sm">
                                        <p className="text-text-muted">New Email from <span className="font-semibold text-text-default">{activity.item.from}</span></p>
                                        <p className="text-text-default truncate">{activity.item.subject}</p>
                                    </div>
                                </>
                            )}
                             {activity.type === 'file' && (
                                <>
                                    <div className="p-2 bg-gray-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></div>
                                    <div className="text-sm">
                                        <p className="text-text-muted">File Uploaded</p>
                                        <p className="text-text-default truncate">{activity.item.name}</p>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
            <div className="bg-card p-5 rounded-xl shadow-sm border border-border">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-text-default">Key Stakeholders</h3>
                    <button onClick={() => setActiveTool('projectContacts')} className="text-sm font-semibold text-primary-dark hover:underline">View All</button>
                </div>
                <ul className="space-y-3">
                    {metrics.projectContacts.slice(0, 4).map(contact => (
                         <li key={contact.id} className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center font-bold text-primary-dark text-lg flex-shrink-0">
                                {contact.name.charAt(0)}
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-text-default">{contact.name}</p>
                                <p className="text-text-muted">{contact.role}, {contact.company}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};