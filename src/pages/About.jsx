import React from 'react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About CareConnect</h1>
        <p className="text-xl text-gray-500">We are on a mission to simplify healthcare coordination and make quality care accessible to everyone.</p>
      </div>
      <div className="card p-10 bg-gradient-to-r from-primary-500 to-primary-700 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">To create a seamless healthcare ecosystem where patients, providers, and facilities can coordinate effectively to deliver the best possible care outcomes.</p>
      </div>
    </div>
  );
}