import React, { useState } from 'react';
import { useOrbis } from "@orbisclub/components";

export default function DonateModal({ isOpen, onClose, post }) {
  const { user } = useOrbis();
  const [amount, setAmount] = useState('20');
  const [currency, setCurrency] = useState('USDC');
  const [donationType, setDonationType] = useState('one-time');
  const [isProcessing, setIsProcessing] = useState(false);

  const currencies = [
    { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
    { symbol: 'USDC', name: 'USD Coin', icon: '💲' },
    { symbol: 'USDT', name: 'Tether', icon: '💵' },
    { symbol: 'DAI', name: 'Dai', icon: '◈' },
  ];

  const presetAmounts = ['10', '25', '50', '100'];

  const handleDonate = async () => {
    if (!user) {
      alert('Please connect your wallet to donate');
      return;
    }

    setIsProcessing(true);
    try {
      // Implement actual donation logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      alert(`Thank you for your ${amount} ${currency} donation!`);
      onClose();
    } catch (error) {
      console.error('Donation failed:', error);
      alert('Donation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Support this project</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your donation helps support public goods and their creators
            </p>
          </div>

          {/* Donation Type */}
          <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                donationType === 'one-time'
                  ? 'bg-[var(--brand-color)] text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setDonationType('one-time')}
            >
              One-time
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                donationType === 'monthly'
                  ? 'bg-[var(--brand-color)] text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setDonationType('monthly')}
            >
              Monthly
            </button>
          </div>

          {/* Currency Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Currency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {currencies.map((cur) => (
                <button
                  key={cur.symbol}
                  onClick={() => setCurrency(cur.symbol)}
                  className={`p-2 text-center rounded-lg border ${
                    currency === cur.symbol
                      ? 'border-[var(--brand-color)] bg-[var(--brand-color)] bg-opacity-10 text-[var(--brand-color)]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{cur.icon}</div>
                  <div className="text-xs font-medium">{cur.symbol}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`py-2 px-4 rounded-lg border text-sm font-medium ${
                    amount === preset
                      ? 'border-[var(--brand-color)] bg-[var(--brand-color)] bg-opacity-10 text-[var(--brand-color)]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {preset} {currency}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] text-gray-900"
                placeholder="Enter amount"
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="text-gray-500">{currency}</span>
              </div>
            </div>
          </div>

          {/* Donate Button */}
          <button
            onClick={handleDonate}
            disabled={isProcessing || !amount}
            className="w-full py-3 px-4 rounded-lg bg-[var(--brand-color)] text-white font-medium hover:bg-[var(--brand-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-color)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              `Donate ${amount} ${currency}`
            )}
          </button>

          {/* Terms */}
          <p className="mt-4 text-xs text-center text-gray-500">
            By donating you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}