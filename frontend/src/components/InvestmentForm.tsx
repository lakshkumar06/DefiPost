import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Project } from '../types';

interface InvestmentFormProps {
  project: Project;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({
  project,
  onSuccess,
  onCancel,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { investInProject } = useProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const investmentAmount = parseFloat(amount);
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      setError('Please enter a valid investment amount');
      return;
    }

    try {
      await investInProject(project.id, investmentAmount);
      setAmount('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make investment');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Investment Amount
        </label>
        <div className="mt-1">
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Enter amount to invest"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Invest
        </button>
      </div>
    </form>
  );
}; 