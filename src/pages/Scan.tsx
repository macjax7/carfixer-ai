
import React from 'react';
import Header from '../components/Header';
import DiagnosticCodeEntry from '../components/DiagnosticCodeEntry';
import PartIdentification from '../components/PartIdentification';

const Scan: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Diagnostics" showBackButton={true} />
      
      <main className="container max-w-md mx-auto px-4 py-6">
        <div className="space-y-6 animate-fade-in">
          <DiagnosticCodeEntry />
          <PartIdentification />
        </div>
      </main>
    </div>
  );
};

export default Scan;
