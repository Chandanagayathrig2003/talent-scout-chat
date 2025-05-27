
import React from 'react';
import HiringAssistant from '../components/HiringAssistant';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TalentScout</h1>
          <p className="text-lg text-gray-600">Intelligent Hiring Assistant</p>
        </div>
        <HiringAssistant />
      </div>
    </div>
  );
};

export default Index;
