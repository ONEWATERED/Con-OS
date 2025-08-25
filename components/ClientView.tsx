


import React, { useMemo, useState } from 'react';
import type { Project, Contact, ClientUpdate, DriveFile } from '../types';

interface ClientViewProps {
  project: Project;
  allContacts: Contact[];
  onExit: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getFileIcon = (file: DriveFile): React.ReactNode => {
    if (file.type.startsWith('image/')) {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    }
    if (file.type === 'application/pdf') {
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0011.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
};

export const ClientView: React.FC<ClientViewProps> = ({ project, allContacts, onExit }) => {
    const [selectedUpdate, setSelectedUpdate] = useState<ClientUpdate | null>(null);

    const data = useMemo(() => {
        const changeOrderTotal = project.invoicing.changeOrders.reduce((acc, co) => acc + co.value, 0);
        const originalContractSum = project.invoicing.lineItems.reduce((acc, item) => acc + item.scheduledValue, 0);
        const contractSumToDate = originalContractSum + changeOrderTotal;

        const totalCompletedAndStored = project.invoicing.lineItems.reduce((acc, item) => acc + item.prevBilled + item.thisPeriod + item.storedMaterials, 0);
        const progressPercentage = contractSumToDate > 0 ? (totalCompletedAndStored / contractSumToDate) * 100 : 0;
        
        const projectContacts = allContacts.filter(contact => project.contactIds.includes(contact.id));
        
        const publishedUpdates = [...project.clientUpdates]
            .filter(u => u.status === 'Published')
            .sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
        
        const closeoutDocuments = project.drive.filter(f => f.folderPath === '/Closeout/' && f.type !== 'folder');

        return { contractSumToDate, progressPercentage, projectContacts, publishedUpdates, closeoutDocuments };
    }, [project, allContacts]);

    if (selectedUpdate) {
        return (
            <div className="max-w-4xl mx-auto">
                 <button onClick={() => setSelectedUpdate(null)} className="text-sm text-primary-dark font-semibold hover:underline mb-4">
                    &larr; Back to Portal Home
                </button>
                <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
                    <h1 className="text-3xl font-bold text-text-default">{selectedUpdate.title}</h1>
                    <p className="text-text-muted mt-1">Published on {new Date(selectedUpdate.publicationDate).toLocaleDateString()}</p>
                    <div className="mt-8 space-y-6 prose max-w-none">
                        {selectedUpdate.sections.map(section => (
                            <div key={section.id}>
                                <h2 className="text-xl font-semibold">{section.heading}</h2>
                                <p className="whitespace-pre-wrap">{section.content}</p>
                                {section.imageUrls.length > 0 && (
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        {section.imageUrls.map(url => <img key={url} src={url} alt="Project photo" className="rounded-lg shadow-md" />)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
    <div className="space-y-8">
        <div className="p-4 bg-indigo-600 text-white rounded-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                 <span className="font-semibold text-sm">You are in Client View mode.</span>
            </div>
            <button onClick={onExit} className="px-3 py-1 text-sm font-semibold bg-white text-indigo-600 rounded-md hover:bg-indigo-100">Exit Client View</button>
        </div>

        <div>
            <h1 className="text-3xl font-bold text-text-default">{project.name}</h1>
            <p className="text-text-muted">{project.address}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-card p-6 rounded-xl shadow-sm border border-border">
                <h2 className="font-semibold text-text-default mb-4">Project Progress</h2>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-green-500 h-4 rounded-full" style={{ width: `${Math.min(data.progressPercentage, 100)}%` }}></div>
                </div>
                <p className="text-right text-lg font-bold mt-2">{data.progressPercentage.toFixed(1)}% Complete</p>
                <div className="mt-4 pt-4 border-t border-border flex justify-between">
                    <p className="text-sm text-text-muted">Current Contract Value</p>
                    <p className="text-lg font-bold">{formatCurrency(data.contractSumToDate)}</p>
                </div>
            </div>
             <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h2 className="font-semibold text-text-default mb-3">Your Contacts</h2>
                 <ul className="space-y-3">
                    {data.projectContacts.slice(0, 2).map(contact => (
                         <li key={contact.id} className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center font-bold text-primary-dark text-lg flex-shrink-0">
                                {contact.name.charAt(0)}
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-text-default">{contact.name}</p>
                                <p className="text-text-muted">{contact.role}</p>
                            </div>
                        </li>
                    ))}
                </ul>
             </div>
        </div>
        
        <div>
            <h2 className="text-2xl font-bold text-text-default mb-4">Weekly Updates</h2>
            {data.publishedUpdates.length === 0 ? (
                <div className="text-center py-16 px-6 bg-card rounded-xl shadow-sm border border-border">
                    <h2 className="mt-4 text-xl font-semibold text-text-default">No updates have been published yet.</h2>
                    <p className="mt-2 text-text-muted">Check back soon for the first project update!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.publishedUpdates.map(update => (
                        <div key={update.id} onClick={() => setSelectedUpdate(update)} className="bg-card p-5 rounded-xl shadow-sm border border-border cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-1 flex flex-col justify-between">
                            <div>
                                <p className="text-sm font-semibold text-primary-dark">{new Date(update.publicationDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <h3 className="text-lg font-bold text-text-default mt-1">{update.title}</h3>
                                <p className="text-sm text-text-muted mt-2">{update.summary}</p>
                            </div>
                            <p className="text-sm font-semibold text-primary-dark hover:underline mt-4">Read more &rarr;</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div>
            <h2 className="text-2xl font-bold text-text-default mb-4">Project Handover Documents</h2>
            {data.closeoutDocuments.length === 0 ? (
                <div className="text-center py-16 px-6 bg-card rounded-xl shadow-sm border border-border">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    <h2 className="mt-4 text-xl font-semibold text-text-default">Final documents are not yet available.</h2>
                    <p className="mt-2 text-text-muted">Warranties, as-builts, and other handover documents will appear here as the project nears completion.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {data.closeoutDocuments.map(file => (
                        <a 
                            key={file.id}
                            href={file.url}
                            download={file.name}
                            className={`group relative bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center justify-center text-center transition-all duration-200 ${file.url ? 'hover:shadow-md hover:border-primary/50 hover:-translate-y-1 cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
                            onClick={(e) => !file.url && e.preventDefault()}
                        >
                            {file.isLocked && (
                                <div className="absolute top-2 right-2 text-gray-400" title="Final Record">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                </div>
                            )}
                            {getFileIcon(file)}
                            <p className="text-sm font-semibold mt-3 text-text-default w-full truncate" title={file.name}>
                                {file.name}
                            </p>
                            <p className="text-xs text-text-muted">
                                {`${(file.size / 1024).toFixed(1)} KB`}
                            </p>
                            {file.url && (
                                <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-bold">Download</span>
                                </div>
                            )}
                        </a>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};