import React from 'react';
import { useToast } from '../context/ToastContext';

const ToastTest = () => {
  const { showToast } = useToast();

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Toast Notifications Test</h2>
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => showToast('This is a success message!', 'success')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Show Success Toast
        </button>
        <button
          onClick={() => showToast('This is an error message!', 'error')}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Show Error Toast
        </button>
        <button
          onClick={() => showToast('This is a warning message!', 'warning')}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
        >
          Show Warning Toast
        </button>
        <button
          onClick={() => showToast('This is an info message!', 'info')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Show Info Toast
        </button>
      </div>
    </div>
  );
};

export default ToastTest;
