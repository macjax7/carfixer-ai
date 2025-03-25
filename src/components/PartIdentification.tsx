
import React, { useRef } from 'react';
import { useVehicles } from '@/hooks/use-vehicles';
import { usePartIdentification } from '@/hooks/part-identification/usePartIdentification';
import UploadSection from './part-identification/UploadSection';
import ResultsDisplay from './part-identification/ResultsDisplay';

const PartIdentification: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedVehicle } = useVehicles();
  
  const {
    isUploading,
    error,
    result,
    rawAnalysis,
    handleFileChange,
    handleDrop,
    handleDragOver,
    resetAnalysis
  } = usePartIdentification(selectedVehicle);
  
  const handleCameraClick = () => {
    // In a real app, this would open the device camera
    fileInputRef.current?.click();
  };
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
      <h2 className="text-lg font-medium mb-3">Identify Part</h2>
      
      {!result ? (
        <UploadSection
          isUploading={isUploading}
          error={error}
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onCameraClick={handleCameraClick}
        />
      ) : (
        <ResultsDisplay
          result={result}
          rawAnalysis={rawAnalysis}
          onReset={resetAnalysis}
          selectedVehicle={selectedVehicle}
        />
      )}
    </div>
  );
};

export default PartIdentification;
