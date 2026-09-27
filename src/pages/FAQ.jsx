import React from 'react';

export default function FAQ() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">How do I book an appointment?</h3>
            <p className="text-gray-600">You can easily book an appointment by navigating to the Appointments section in your dashboard and clicking on "Book New". Select your preferred specialty, date, and time.</p>
          </div>
        ))}
      </div>
    </div>
  );
}