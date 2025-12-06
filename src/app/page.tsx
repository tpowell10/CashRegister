'use client';

import { useState } from 'react';
import { Calculator } from '@/components/Calculator';
import { FileUploader } from '@/components/FileUploader';

type Tab = 'calculator' | 'batch';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Cash Register</h1>
          <p className="mt-1 text-gray-600">
            Calculate change with the perfect denominations
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-8" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'calculator'}
            aria-controls="panel-calculator"
            onClick={() => setActiveTab('calculator')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${activeTab === 'calculator' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}
            `}
          >
            Quick Calculate
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'batch'}
            aria-controls="panel-batch"
            onClick={() => setActiveTab('batch')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${activeTab === 'batch' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}
            `}
          >
            File Upload
          </button>
        </div>

        {/* Tab Panels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'calculator' && (
            <div id="panel-calculator" role="tabpanel" aria-labelledby="tab-calculator"            >
              <Calculator />
            </div>
          )}

          {activeTab === 'batch' && (
            <div id="panel-batch" role="tabpanel" aria-labelledby="tab-batch"            >
              <FileUploader />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How it works</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Standard Mode</h3>
              <p className="text-sm text-gray-600">
                Returns the minimum number of bills and coins needed for the change amount.
                Uses a greedy algorithm starting with the largest denominations.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-2">Random Mode</h3>
              <p className="text-sm text-gray-600">
                When the change amount (in cents) is divisible by 3, the denominations are
                randomized for a fun twist. The total is still correct!
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="font-medium text-gray-800 mb-2">File Format</h3>
            <p className="text-sm text-gray-600 mb-2">
              Upload a text file with one transaction per line:
            </p>
            <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto">
              {`2.12,3.00\n1.97,2.00\n3.33,5.00`}
            </pre>
            <p className="mt-2 text-sm text-gray-500">
              Format: <code className="bg-gray-100 px-1 rounded">amount_owed,amount_paid</code>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Cash Register Solution</p>
          <p className="mt-1">
            Built with Next.js, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </main>
  );
}
