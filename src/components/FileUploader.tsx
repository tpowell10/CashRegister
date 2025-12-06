'use client';

import { useState, useRef, useCallback } from 'react';

interface BatchResult {
  amountOwed: number;
  amountPaid: number;
  changeAmount: number;
  formatted: string;
  wasRandomized: boolean;
  warning?: string;
}

interface BatchError {
  lineNumber: number;
  message: string;
  raw: string;
}

interface BatchResponse {
  results: BatchResult[];
  errors: BatchError[];
  formattedOutput: string;
}

export function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [response, setResponse] = useState<BatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    setResponse(null);
    setFileName(file.name);
    setLoading(true);

    try {
      const text = await file.text();

      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'An error occurred');
        return;
      }

      setResponse(data.data);
    } catch {
      setError('Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDownload = () => {
    if (!response) return;

    const blob = new Blob([response.formattedOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'change-output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setResponse(null);
    setError(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div className="space-y-2">
          <svg
            className={`mx-auto h-12 w-12 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <p className="text-gray-600">
            <span className="font-medium text-emerald-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-gray-500">
            TXT or CSV file with format: amount_owed,amount_paid (one per line)
          </p>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-emerald-600">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {response && (
        <div className="space-y-4 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Results</h3>
              {fileName && (
                <p className="text-sm text-gray-500">File: {fileName}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 
                           rounded-lg hover:bg-emerald-100 transition-colors"
              >
                Download Results
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 
                           rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-700">{response.results.length}</p>
              <p className="text-sm text-emerald-600">Successful</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{response.errors.length}</p>
              <p className="text-sm text-red-600">Errors</p>
            </div>
          </div>

          {/* Results Table */}
          {response.results.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">#</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Owed</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Paid</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Change</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Denominations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {response.results.map((result, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3">${result.amountOwed.toFixed(2)}</td>
                      <td className="px-4 py-3">${result.amountPaid.toFixed(2)}</td>
                      <td className="px-4 py-3 font-medium text-emerald-700">
                        ${result.changeAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={result.wasRandomized ? 'text-purple-600' : ''}>
                          {result.formatted}
                        </span>
                        {result.wasRandomized && (
                          <span className="ml-2 text-xs text-purple-500">(random)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Errors Table */}
          {response.errors.length > 0 && (
            <div className="border border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-50 px-4 py-2 border-b border-red-200">
                <h4 className="font-medium text-red-800">Errors</h4>
              </div>
              <div className="divide-y divide-red-100">
                {response.errors.map((err, i) => (
                  <div key={i} className="px-4 py-3 text-sm">
                    <p className="text-red-700">
                      <span className="font-medium">Line {err.lineNumber}:</span> {err.message}
                    </p>
                    <p className="text-red-500 font-mono text-xs mt-1">{err.raw}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Output */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
              View Raw Output
            </summary>
            <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto">
              {response.formattedOutput || 'No output'}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

