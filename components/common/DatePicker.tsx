import React from 'react';

interface DatePickerProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, name, required, className, disabled }) => {
    const baseInputClass = "w-full px-3 py-2 pr-10 bg-white border border-border rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed";

    return (
        <div className={`relative ${className || ''}`}>
            <input
                type="date"
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={baseInputClass}
            />
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        </div>
    );
};
