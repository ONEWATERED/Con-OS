
import React, { useState } from 'react';
import type { ChangeOrderFormState, Project } from '../types';
import { generateChangeOrder } from '../services/geminiService';
import { Spinner } from './common/Spinner';

interface ChangeOrderGeneratorProps {
  project: Project;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-text-muted rounded-md transition-colors"
      aria-label="Copy text"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

export const ChangeOrderGenerator: React.FC<ChangeOrderGeneratorProps> = ({ project }) => {
  const [formData, setFormData] = useState<ChangeOrderFormState>({
    scopeChange: '',
    costImpact: '',
    scheduleImpact: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedText('');
    try {
      const result = await generateChangeOrder(formData, project.name);
      setGeneratedText(result);
    } catch (err) {
      setError(err instanceof Error ? `Generation Error: ${err.message}` : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const formControlClass = "w-full px-3 py-2 bg-white border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-150 ease-in-out text-text-default";
  const labelClass = "block text-sm font-medium text-text-muted mb-1";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form Column */}
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="mb-4">
              <h2 className="text-xl font-semibold text-text-default">Change Order Details</h2>
              <p className="text-sm text-text-muted">For project: <span className="font-semibold">{project.name}</span></p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="scopeChange" className={labelClass}>
                Scope Change Description
              </label>
              <textarea
                id="scopeChange"
                name="scopeChange"
                value={formData.scopeChange}
                onChange={handleChange}
                rows={6}
                className={formControlClass}
                placeholder="e.g., Add two new GFCI outlets in the master bedroom on the north wall."
                required
              />
            </div>
            <div>
              <label htmlFor="costImpact" className={labelClass}>
                Impact on Contract Price
              </label>
              <input
                type="text"
                id="costImpact"
                name="costImpact"
                value={formData.costImpact}
                onChange={handleChange}
                className={formControlClass}
                placeholder="e.g., Increase of $450.00"
                required
              />
            </div>
            <div>
              <label htmlFor="scheduleImpact" className={labelClass}>
                Impact on Contract Time
              </label>
              <input
                type="text"
                id="scheduleImpact"
                name="scheduleImpact"
                value={formData.scheduleImpact}
                onChange={handleChange}
                className={formControlClass}
                placeholder="e.g., Extend by 1 day"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-black bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Change Order'}
            </button>
          </form>
        </div>

        {/* Output Display Column */}
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border h-full min-h-[600px] flex flex-col">
          <h2 className="text-xl font-semibold text-text-default mb-4">Generated Document</h2>
          {isLoading && (
            <div className="flex flex-col items-center justify-center flex-grow text-text-muted">
              <Spinner />
              <p className="mt-4 text-center">Drafting document...</p>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center flex-grow text-red-600 bg-red-50 p-4 rounded-md">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
          {generatedText && !isLoading && (
             <div className="relative flex-grow">
               <pre className="p-4 bg-gray-50 border border-border rounded-lg whitespace-pre-wrap font-sans text-sm text-text-default overflow-y-auto h-full">{generatedText}</pre>
               <CopyButton text={generatedText} />
             </div>
          )}
          {!generatedText && !isLoading && !error && (
            <div className="flex items-center justify-center flex-grow text-text-muted text-center">
              <p>Your generated Change Order document will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
