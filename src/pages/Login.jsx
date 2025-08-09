import React from 'react';

// Simple login page component
export default function Login({ handleLogin }) {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard Login</h2>
        <p className="text-gray-600 mb-6">
          Click the button below to simulate logging in.
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Log In
        </button>
      </div>
    </div>
  );
}
