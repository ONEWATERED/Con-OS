

import React, { useState, useMemo } from 'react';
import type { Project, Contact, RiskItem, RiskStatus, RiskSeverity, RiskCategory, Meeting, AgendaUpdate } from '../types';
import { identifyProjectRisks } from '../services/geminiService';
import { Spinner } from './common/Spinner';
import { PrintMeetingSummary } from './PrintMeetingSummary';

interface RiskManagerProps {
  project: Project;
  allContacts: Contact[];
  onUpdateProject: (projectId: string, updatedData: Partial<Project>) => void;
}

const severityConfig: Record<RiskSeverity, { color: string, label: string }> = {
    High: { color: 'bg-red-100 text-red-800 border-red-300', label: 'High' },
    Medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Medium' },
    Low: { color: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Low' },
};

const categoryConfig: Record<RiskCategory, { color: string, label: string }> = {
    Schedule: { color: 'bg-blue-100 text-blue-800', label: 'Schedule' },
    Budget: { color: 'bg-green-100 text-green-800', label: 'Budget' },
    Safety: { color: 'bg-orange-100 text-orange-800', label: 'Safety' },
    Quality: { color: 'bg-purple-100 text-purple-800', label: 'Quality' },
    Communication: { color: 'bg-pink-100 text-pink-800', label: 'Communication' },
    Other: { color: 'bg-indigo-100 text-indigo-800', label: 'Other' },
};

const RiskCard: React.FC<{ risk?: RiskItem; onAccept?: (riskId: string) => void; onReject?: (riskId: string) => void; }> = ({ risk, onAccept, onReject }) => {
    if (!risk) return null;
    
    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-3">
            <div className="flex justify-between items-start">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${categoryConfig[risk.category]?.color || categoryConfig.Other.color}`}>
                    {risk.category}
                </span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${severityConfig[risk.severity]?.color || severityConfig.Low.color}`}>
                    {risk.severity} Severity
                </span>
            </div>
            <p className="text-sm text-text-default">{risk.description}</p>
            <div>
                <h4 className="text-xs font-bold text-text-muted uppercase">Mitigation Plan</h4>
                <p className="text-sm text-text-muted mt-1">{risk.mitigationPlan}</p>
            </div>
            {(onAccept && onReject) && (
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                    <button onClick={() => onAccept(risk.id)} className="w-full px-3 py-1.5 text-sm font-semibold bg-green-600 text-white rounded-md hover:bg-green-700">Accept</button>
                    <button onClick={() => onReject(risk.id)} className="w-full px-3 py-1.5 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700">Reject</button>
                </div>
            )}
        </div>
    );
};

const RiskColumn: React.FC<{ title: string; risks: RiskItem[]; children: (risk: RiskItem) => React.ReactNode; }> = ({ title, risks, children }) => (
    <div className="bg-gray-50/70 p-3 rounded-lg w-full">
        <h3 className="text-md font-semibold text-text-default px-2 mb-3">{title} ({risks.length})</h3>
        <div className="space-y-3 h-[calc(100vh-22rem)] overflow-y-auto pr-2 -mr-2">
            {risks.length === 0 && <p className="text-sm text-center text-gray-500 py-4">No risks in this category.</p>}
            {risks.map(risk => children(risk))}
        </div>
    </div>
);

export const RiskManager: React.FC<RiskManagerProps> = ({ project, allContacts, onUpdateProject }) => {
    const [view, setView] = useState<'register' | 'meetings'>('register');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
    const [agendaUpdates, setAgendaUpdates] = useState<Record<string, { updateText: string; status: 'In Progress' | 'Closed' }>>({});
    const [selectedMeetingHistory, setSelectedMeetingHistory] = useState<Meeting | null>(null);

    const handleAnalyzeRisks = async () => {
        setIsAnalyzing(true);
        setAnalysisError(null);
        try {
            const newRiskData = await identifyProjectRisks(project, allContacts);
            const existingRiskDescriptions = new Set(project.riskManagement.risks.map(r => r.description));
            const trulyNewRisks = newRiskData.filter(r => !existingRiskDescriptions.has(r.description));
            
            const newRiskItems: RiskItem[] = trulyNewRisks.map(risk => ({
                description: risk.description,
                category: risk.category,
                severity: risk.severity,
                mitigationPlan: risk.mitigationPlan,
                id: `risk-${Date.now()}-${Math.random()}`,
                status: 'Pending',
                createdAt: new Date().toISOString(),
                updates: [],
            }));

            onUpdateProject(project.id, { 
                riskManagement: { ...project.riskManagement, risks: [...project.riskManagement.risks, ...newRiskItems] }
            });
        } catch (err) {
            setAnalysisError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleRiskStatusChange = (riskId: string, status: 'Accepted' | 'Rejected') => {
        const updatedRisks = project.riskManagement.risks.map(risk => 
            risk.id === riskId ? { ...risk, status } : risk
        );
        onUpdateProject(project.id, { riskManagement: { ...project.riskManagement, risks: updatedRisks } });
    };

    const handleStartMeeting = () => {
        const newMeeting: Meeting = {
            id: `meeting-${Date.now()}`,
            date: new Date().toISOString(),
            title: `Weekly Sync - ${new Date().toLocaleDateString()}`,
            attendees: [project.clientName],
        };
        setActiveMeeting(newMeeting);
        
        // Pre-populate agenda updates state for active risks
        const initialUpdates: typeof agendaUpdates = {};
        project.riskManagement.risks
            .filter(r => r.status === 'Accepted' && r.updates[r.updates.length-1]?.status !== 'Closed')
            .forEach(r => {
                initialUpdates[r.id] = { updateText: '', status: 'In Progress' };
            });
        setAgendaUpdates(initialUpdates);
    };

    const handleConcludeMeeting = () => {
        if (!activeMeeting) return;

        const timestamp = new Date().toISOString();
        const updatedRisks = project.riskManagement.risks.map(risk => {
            if (agendaUpdates[risk.id]) {
                const latestStatus = risk.updates[risk.updates.length-1]?.status;
                const newUpdate: AgendaUpdate = {
                    meetingId: activeMeeting.id,
                    timestamp,
                    updateText: agendaUpdates[risk.id].updateText,
                    status: agendaUpdates[risk.id].updateText ? agendaUpdates[risk.id].status : latestStatus === 'Closed' ? 'Closed' : 'Carried Over',
                };
                 return { ...risk, updates: [...risk.updates, newUpdate], status: (newUpdate.status === 'Closed' ? 'Closed' : 'Accepted') as RiskStatus };
            }
            return risk;
        });

        onUpdateProject(project.id, {
            riskManagement: {
                meetings: [...project.riskManagement.meetings, activeMeeting],
                risks: updatedRisks,
            }
        });

        setActiveMeeting(null);
        setAgendaUpdates({});
    };

    const handlePrintMeeting = (meeting: Meeting) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const risksForMeeting = project.riskManagement.risks.filter(risk => 
                risk.updates.some(u => u.meetingId === meeting.id)
            );
            
            const content = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Meeting Summary - ${meeting.title}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="font-sans">
                    <div id="print-root"></div>
                </body>
                </html>
            `;
            printWindow.document.write(content);
            printWindow.document.close();
            
            const root = (printWindow.document.getElementById('print-root') as any).__react_root_container = (window as any).ReactDOM.createRoot(printWindow.document.getElementById('print-root'));
            root.render(<PrintMeetingSummary meeting={meeting} risks={risksForMeeting} project={project} />);

            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    };
    

    const { pendingRisks, acceptedRisks, rejectedRisks } = useMemo(() => ({
        pendingRisks: project.riskManagement.risks.filter(r => r.status === 'Pending'),
        acceptedRisks: project.riskManagement.risks.filter(r => r.status === 'Accepted' || r.status === 'Closed'),
        rejectedRisks: project.riskManagement.risks.filter(r => r.status === 'Rejected'),
    }), [project.riskManagement.risks]);
    
    const agendaItems = useMemo(() => {
        if (!activeMeeting) return [];
        return project.riskManagement.risks.filter(r => r.status === 'Accepted' && r.updates[r.updates.length-1]?.status !== 'Closed');
    }, [project.riskManagement.risks, activeMeeting]);

    if (activeMeeting) {
        return (
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h2 className="text-2xl font-bold">Meeting in Progress: {activeMeeting.title}</h2>
                <div className="mt-6 space-y-6">
                    {agendaItems.map(risk => (
                        <div key={risk.id} className="p-4 border border-border rounded-lg bg-gray-50/50">
                            <RiskCard risk={risk} />
                            <div className="mt-4">
                                <label className="text-sm font-semibold">Update / Discussion</label>
                                <textarea 
                                    rows={3} 
                                    className="w-full mt-1 p-2 border border-border rounded-md"
                                    value={agendaUpdates[risk.id]?.updateText || ''}
                                    onChange={e => setAgendaUpdates(prev => ({...prev, [risk.id]: {...prev[risk.id], updateText: e.target.value}}))}
                                />
                                <div className="mt-2">
                                    <label className="text-sm font-semibold mr-2">Status:</label>
                                    <select
                                        value={agendaUpdates[risk.id]?.status || 'In Progress'}
                                        onChange={e => setAgendaUpdates(prev => ({...prev, [risk.id]: {...prev[risk.id], status: e.target.value as any}}))}
                                        className="p-1 border border-border rounded-md text-sm"
                                    >
                                        <option value="In Progress">In Progress</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleConcludeMeeting} className="px-6 py-2.5 bg-primary text-black font-semibold rounded-lg shadow-sm hover:bg-primary-dark">Conclude Meeting</button>
                </div>
            </div>
        );
    }
    
    if (selectedMeetingHistory) {
         const risksForMeeting = project.riskManagement.risks.filter(risk => risk.updates.some(u => u.meetingId === selectedMeetingHistory.id));
        return (
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <div className="flex justify-between items-start">
                    <div>
                        <button onClick={() => setSelectedMeetingHistory(null)} className="text-sm text-primary-dark font-semibold hover:underline mb-2">&larr; Back to Meetings</button>
                        <h2 className="text-2xl font-bold">Meeting Summary: {selectedMeetingHistory.title}</h2>
                        <p className="text-text-muted">{new Date(selectedMeetingHistory.date).toLocaleString()}</p>
                    </div>
                     <button onClick={() => handlePrintMeeting(selectedMeetingHistory)} className="px-4 py-2 bg-gray-200 text-sm font-semibold rounded-lg">Print Summary</button>
                </div>
                <div className="mt-6 space-y-4">
                    {risksForMeeting.map(risk => {
                        const update = risk.updates.find(u => u.meetingId === selectedMeetingHistory.id);
                        return (
                            <div key={risk.id} className="p-4 border border-border rounded-lg">
                                <p className="font-semibold">{risk.description}</p>
                                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm"><span className="font-semibold">Update:</span> {update?.updateText || 'No update provided.'}</p>
                                    <p className="text-sm mt-1"><span className="font-semibold">Resulting Status:</span> {update?.status}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text-default">Risk Management</h2>
                <div className="flex items-center space-x-2">
                    <div className="p-1 bg-gray-200 rounded-lg flex space-x-1">
                        <button onClick={() => setView('register')} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${view === 'register' ? 'bg-white shadow' : 'text-gray-600'}`}>Risk Register</button>
                        <button onClick={() => setView('meetings')} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${view === 'meetings' ? 'bg-white shadow' : 'text-gray-600'}`}>Meetings</button>
                    </div>
                </div>
            </div>

            {view === 'register' && (
                <>
                    <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold">AI Risk Analysis</h3>
                            <p className="text-sm text-text-muted">Scan all project data to identify potential new risks.</p>
                             {analysisError && <p className="text-sm text-red-600 mt-1">Error: {analysisError}</p>}
                        </div>
                        <button onClick={handleAnalyzeRisks} disabled={isAnalyzing} className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm text-black bg-primary hover:bg-primary-dark disabled:opacity-50">
                            {isAnalyzing ? <><Spinner /> <span className="ml-2">Analyzing...</span></> : 'Analyze Project for Risks'}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <RiskColumn title="Pending Review" risks={pendingRisks}>
                            {(risk) => <RiskCard key={risk.id} risk={risk} onAccept={(riskId) => handleRiskStatusChange(riskId, 'Accepted')} onReject={(riskId) => handleRiskStatusChange(riskId, 'Rejected')} />}
                        </RiskColumn>
                        <RiskColumn title="Active & Closed Risks" risks={acceptedRisks}>
                             {(risk) => <RiskCard key={risk.id} risk={risk} />}
                        </RiskColumn>
                        <RiskColumn title="Rejected / Archived" risks={rejectedRisks}>
                           {(risk) => <RiskCard key={risk.id} risk={risk} />}
                        </RiskColumn>
                    </div>
                </>
            )}

            {view === 'meetings' && (
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Project Meetings</h3>
                        <button onClick={handleStartMeeting} className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm text-black bg-primary hover:bg-primary-dark">Start New Meeting</button>
                    </div>
                    <div className="border border-border rounded-lg overflow-hidden">
                        <ul className="divide-y divide-border">
                            {project.riskManagement.meetings.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(meeting => (
                                <li key={meeting.id} className="p-3 hover:bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{meeting.title}</p>
                                        <p className="text-sm text-text-muted">{new Date(meeting.date).toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => setSelectedMeetingHistory(meeting)} className="px-3 py-1.5 bg-white border border-border text-sm font-semibold rounded-md">View Summary</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
