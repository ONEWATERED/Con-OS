import React, { useState, useMemo } from 'react';
import type { Project, CustomReport, ReportableDataSource, Filter, Grouping, CannedReportId } from '../types';
import { REPORTABLE_DATA_SOURCES } from '../constants';
import { processReport } from '../services/reportingService';
import { Spinner } from './common/Spinner';
import { DatePicker } from './common/DatePicker';

interface ReportingProps {
  project: Project;
  onUpdateProject: (projectId: string, updatedData: Partial<Project>) => void;
}

type ReportView = 'list' | 'builder' | 'viewer';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

// =================================================================
// == Report Viewer Component
// =================================================================
const ReportViewer: React.FC<{
    project: Project;
    config: CustomReport | { id: CannedReportId };
    onBack: () => void;
}> = ({ project, config, onBack }) => {
    
    if ('id' in config && config.id === 'financialSummary') {
        const originalContractSum = project.invoicing.lineItems.reduce((acc, item) => acc + item.scheduledValue, 0);
        const netChangeByCOs = project.invoicing.changeOrders.reduce((acc, co) => acc + co.value, 0);
        const contractSumToDate = originalContractSum + netChangeByCOs;
        const totalBilled = project.invoicing.lineItems.reduce((acc, item) => acc + item.prevBilled + item.thisPeriod, 0);
        const totalExpenses = project.expenses.reduce((acc, exp) => acc + exp.amount, 0);
        
        return (
            <div>
                <button onClick={onBack} className="text-sm text-primary-dark font-semibold hover:underline mb-4">&larr; Back to Reports</button>
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="text-xl font-bold mb-4">Project Financial Summary</h3>
                    <dl className="divide-y divide-border">
                        <div className="py-3 flex justify-between"><dt>Original Contract Sum</dt><dd>{formatCurrency(originalContractSum)}</dd></div>
                        <div className="py-3 flex justify-between"><dt>Net Change by Change Orders</dt><dd>{formatCurrency(netChangeByCOs)}</dd></div>
                        <div className="py-3 flex justify-between font-bold"><dt>Contract Sum to Date</dt><dd>{formatCurrency(contractSumToDate)}</dd></div>
                        <div className="py-3 flex justify-between"><dt>Total Billed to Date</dt><dd>{formatCurrency(totalBilled)}</dd></div>
                        <div className="py-3 flex justify-between"><dt>Total Expenses Logged</dt><dd className="text-red-600">({formatCurrency(totalExpenses)})</dd></div>
                    </dl>
                </div>
            </div>
        );
    }
    
    const { title, columns, rows, isGrouped, grouping } = processReport(project, config);

    const renderCell = (row: any, column: string) => {
        const value = row[column];
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'number') {
            if (column.toLowerCase().includes('amount') || column.toLowerCase().includes('value')) {
                return formatCurrency(value);
            }
            return value;
        }
        if (column.toLowerCase().includes('date')) {
            try {
                return formatDate(value);
            } catch (e) {
                return value; // If not a valid date string
            }
        }
        return value;
    };

    return (
        <div>
            <button onClick={onBack} className="text-sm text-primary-dark font-semibold hover:underline mb-4">&larr; Back to Reports</button>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                
                {isGrouped && rows.length > 0 && grouping && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-semibold mb-2">Summary Chart</h4>
                        <div className="flex items-end space-x-2 h-40 border-l border-b border-gray-300 p-2">
                             {rows.map((row: any, index: number) => (
                                <div key={index} className="flex-1 flex flex-col items-center justify-end" title={`${row[grouping.field]}: ${renderCell(row, grouping.aggField)}`}>
                                    <div className="text-xs font-bold">{renderCell(row, grouping.aggField)}</div>
                                    <div className="w-full bg-blue-400 hover:bg-blue-500" style={{ height: `${Math.max(5, (row[grouping.aggField] / Math.max(1, ...rows.map((r:any) => r[grouping.aggField]))) * 100)}%` }}></div>
                                    <div className="text-xs text-gray-500 mt-1 truncate">{row[grouping.field]}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-text-muted">
                            <tr>{columns.map(col => <th key={col} className="px-4 py-2 text-left">{col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>)}</tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border">
                            {rows.map((row: any, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    {columns.map(col => <td key={col} className="px-4 py-3">{renderCell(row, col)}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// =================================================================
// == Report Builder Component
// =================================================================
const ReportBuilder: React.FC<{
    project: Project;
    report: CustomReport | null;
    onSave: (report: CustomReport) => void;
    onRun: (report: CustomReport) => void;
    onBack: () => void;
}> = ({ project, report, onSave, onRun, onBack }) => {
    const [builderState, setBuilderState] = useState<CustomReport>(report || {
        id: `custom-${Date.now()}`,
        name: '',
        dataSource: 'expenses',
        fields: [],
        filters: [],
    });

    const dataSourceInfo = REPORTABLE_DATA_SOURCES[builderState.dataSource];

    const handleFieldToggle = (fieldId: string) => {
        setBuilderState(prev => ({
            ...prev,
            fields: prev.fields.includes(fieldId) ? prev.fields.filter(f => f !== fieldId) : [...prev.fields, fieldId]
        }));
    };

    const addFilter = () => {
        const newFilter: Filter = { id: `filter-${Date.now()}`, field: dataSourceInfo.fields[0].id, operator: 'equals', value: '' };
        setBuilderState(prev => ({ ...prev, filters: [...prev.filters, newFilter] }));
    };
    
    const updateFilter = (filterId: string, updatedFilter: Partial<Filter>) => {
        setBuilderState(prev => ({ ...prev, filters: prev.filters.map(f => f.id === filterId ? {...f, ...updatedFilter} : f) }));
    };
    
    const removeFilter = (filterId: string) => {
        setBuilderState(prev => ({...prev, filters: prev.filters.filter(f => f.id !== filterId) }));
    };
    
    return (
        <div>
            <button onClick={onBack} className="text-sm text-primary-dark font-semibold hover:underline mb-4">&larr; Back to Reports</button>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6">
                <h2 className="text-xl font-bold">{report ? 'Edit Custom Report' : 'Create Custom Report'}</h2>
                
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium">Report Name</label>
                        <input type="text" value={builderState.name} onChange={e => setBuilderState(s => ({...s, name: e.target.value}))} className="w-full mt-1 p-2 border rounded-md"/>
                     </div>
                     <div>
                        <label className="block text-sm font-medium">Data Source</label>
                        <select value={builderState.dataSource} onChange={e => setBuilderState(s => ({...s, dataSource: e.target.value as ReportableDataSource, fields: [], filters: [], grouping: undefined}))} className="w-full mt-1 p-2 border rounded-md bg-white">
                            {Object.entries(REPORTABLE_DATA_SOURCES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                        </select>
                     </div>
                </div>

                {/* Columns */}
                <div>
                    <h3 className="font-semibold">Columns to Include</h3>
                    <div className="mt-2 grid grid-cols-3 gap-2 p-3 border rounded-lg bg-gray-50/50">
                        {dataSourceInfo.fields.map(field => (
                            <label key={field.id} className="flex items-center space-x-2">
                                <input type="checkbox" checked={builderState.fields.includes(field.id)} onChange={() => handleFieldToggle(field.id)} />
                                <span>{field.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div>
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Filters</h3>
                        <button onClick={addFilter} className="text-sm bg-gray-200 px-3 py-1 rounded-md">Add Filter</button>
                    </div>
                    <div className="mt-2 space-y-2">
                        {builderState.filters.map(filter => {
                             const fieldInfo = dataSourceInfo.fields.find(f => f.id === filter.field);
                             const isDate = fieldInfo?.type === 'date';
                             const isDateRange = isDate && filter.operator === 'is_between';

                             return (
                                 <div key={filter.id} className="flex items-center space-x-2">
                                    <select value={filter.field} onChange={e => updateFilter(filter.id, {field: e.target.value, value: ''})} className="p-2 border rounded-md bg-white">
                                        {dataSourceInfo.fields.filter(f=>f.filterable).map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                    </select>
                                     <select value={filter.operator} onChange={e => {
                                         const newOperator = e.target.value;
                                         const value = (newOperator === 'is_between' && isDate) ? ['', ''] : '';
                                         updateFilter(filter.id, { operator: newOperator, value });
                                     }} className="p-2 border rounded-md bg-white">
                                        <option value="equals">is equal to</option>
                                        <option value="not_equals">is not equal to</option>
                                        <option value="contains">contains</option>
                                        <option value="greater_than">&gt;</option>
                                        <option value="less_than">&lt;</option>
                                        {isDate && <option value="is_between">is between</option>}
                                     </select>
                                     
                                    {isDateRange ? (
                                        <>
                                            <DatePicker
                                                name="start_date"
                                                value={Array.isArray(filter.value) ? filter.value[0] || '' : ''}
                                                onChange={e => updateFilter(filter.id, {value: [e.target.value, Array.isArray(filter.value) ? (filter.value[1] || '') : '']})}
                                                className="flex-grow"
                                            />
                                            <span className="text-sm text-gray-500">to</span>
                                            <DatePicker
                                                name="end_date"
                                                value={Array.isArray(filter.value) ? filter.value[1] || '' : ''}
                                                onChange={e => updateFilter(filter.id, {value: [Array.isArray(filter.value) ? (filter.value[0] || '') : '', e.target.value]})}
                                                className="flex-grow"
                                            />
                                        </>
                                    ) : isDate ? (
                                        <DatePicker
                                            name="value"
                                            value={filter.value as string || ''}
                                            onChange={e => updateFilter(filter.id, {value: e.target.value})}
                                            className="flex-grow"
                                        />
                                    ) : (
                                        <input type="text" value={filter.value as string || ''} onChange={e => updateFilter(filter.id, {value: e.target.value})} className="flex-grow p-2 border rounded-md"/>
                                    )}

                                     <button onClick={() => removeFilter(filter.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">&times;</button>
                                 </div>
                             );
                        })}
                    </div>
                </div>
                
                {/* Grouping */}
                <div>
                    <h3 className="font-semibold">Grouping & Summarization</h3>
                     <div className="mt-2 flex items-center space-x-2 p-3 border rounded-lg bg-gray-50/50">
                        <label>Group by:</label>
                         <select value={builderState.grouping?.field} onChange={e => setBuilderState(s => ({...s, grouping: {...s.grouping!, field: e.target.value}}))} className="p-2 border rounded-md bg-white">
                             <option value="">None</option>
                             {dataSourceInfo.fields.filter(f=>f.groupable).map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                         </select>
                         {builderState.grouping?.field && <>
                             <label>Then:</label>
                              <select value={builderState.grouping?.aggregation} onChange={e => setBuilderState(s => ({...s, grouping: {...s.grouping!, aggregation: e.target.value as any}}))} className="p-2 border rounded-md bg-white">
                                 <option value="count">Count</option>
                                 <option value="sum">Sum</option>
                                 <option value="avg">Average</option>
                             </select>
                             <label>of</label>
                               <select value={builderState.grouping?.aggField} onChange={e => setBuilderState(s => ({...s, grouping: {...s.grouping!, aggField: e.target.value}}))} className="p-2 border rounded-md bg-white">
                                 {dataSourceInfo.fields.filter(f=>f.aggregatable).map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                             </select>
                         </>}
                     </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                    <button onClick={() => onRun(builderState)} className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm text-black bg-primary hover:bg-primary-dark">Run Report</button>
                    <button onClick={() => onSave(builderState)} className="px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm bg-blue-600 text-white hover:bg-blue-700">Save Report</button>
                </div>
            </div>
        </div>
    )
}

// =================================================================
// == Main Reporting Component
// =================================================================
export const Reporting: React.FC<ReportingProps> = ({ project, onUpdateProject }) => {
  const [view, setView] = useState<ReportView>('list');
  const [activeReportConfig, setActiveReportConfig] = useState<CustomReport | { id: CannedReportId } | null>(null);
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null);

  const cannedReports = [
    { id: 'financialSummary', name: 'Project Financial Summary', description: 'High-level overview of contract value, change orders, and expenses.' },
    { id: 'expenseByCategory', name: 'Expense by Category', description: 'Total spending grouped by expense category.' },
    { id: 'rfiLog', name: 'Full RFI Log', description: 'A complete list of all RFIs and their current status.' },
    { id: 'billableExpenses', name: 'Uninvoiced Billable Expenses', description: 'Actionable list of expenses pending client billing.' },
  ];

  const handleRunReport = (config: CustomReport | { id: CannedReportId }) => {
    setActiveReportConfig(config);
    setView('viewer');
  };

  const handleSaveReport = (report: CustomReport) => {
    const existingIndex = project.customReports.findIndex(r => r.id === report.id);
    if (existingIndex > -1) {
        const updatedReports = [...project.customReports];
        updatedReports[existingIndex] = report;
        onUpdateProject(project.id, { customReports: updatedReports });
    } else {
        onUpdateProject(project.id, { customReports: [...project.customReports, report] });
    }
    setView('list');
    setEditingReport(null);
  };
  
  const handleEditReport = (report: CustomReport) => {
    setEditingReport(report);
    setView('builder');
  };

  const handleDeleteReport = (reportId: string) => {
    if (window.confirm("Are you sure you want to delete this custom report?")) {
        onUpdateProject(project.id, { customReports: project.customReports.filter(r => r.id !== reportId) });
    }
  };

  const ReportCard: React.FC<{title: string, description: string, onClick: () => void}> = ({ title, description, onClick }) => (
    <div onClick={onClick} className="bg-card p-5 rounded-xl shadow-sm border border-border cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-1">
        <h3 className="font-bold text-text-default">{title}</h3>
        <p className="text-sm text-text-muted mt-1">{description}</p>
    </div>
  );

  if (view === 'viewer' && activeReportConfig) {
    return <ReportViewer project={project} config={activeReportConfig} onBack={() => setView('list')} />;
  }
  
  if (view === 'builder') {
    return <ReportBuilder project={project} report={editingReport} onSave={handleSaveReport} onRun={handleRunReport} onBack={() => setView('list')} />;
  }

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-text-default">Reporting Dashboard</h2>
            <p className="text-sm text-text-muted">Generate insights from your project data.</p>
        </div>
        
        <div>
            <h3 className="text-xl font-semibold mb-3">Canned Reports</h3>
            <div className="grid grid-cols-2 gap-4">
                {cannedReports.map(r => <ReportCard key={r.id} title={r.name} description={r.description} onClick={() => handleRunReport({ id: r.id as CannedReportId })}/>)}
            </div>
        </div>
        
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold">Custom Reports</h3>
                <button onClick={() => { setEditingReport(null); setView('builder'); }} className="px-4 py-2 text-sm font-semibold bg-primary text-black rounded-lg shadow-sm hover:bg-primary-dark">Create Custom Report</button>
            </div>
            {project.customReports.length === 0 ? (
                <p className="text-text-muted text-center py-8">No custom reports saved yet.</p>
            ) : (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <ul className="divide-y divide-border">
                        {project.customReports.map(report => (
                            <li key={report.id} className="p-3 flex justify-between items-center hover:bg-gray-50/50">
                                <div>
                                    <p className="font-semibold cursor-pointer" onClick={() => handleRunReport(report)}>{report.name}</p>
                                    <p className="text-xs text-text-muted">Source: {REPORTABLE_DATA_SOURCES[report.dataSource].label}</p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => handleEditReport(report)} className="text-sm">Edit</button>
                                    <button onClick={() => handleDeleteReport(report.id)} className="text-sm text-red-600">Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
  );
};