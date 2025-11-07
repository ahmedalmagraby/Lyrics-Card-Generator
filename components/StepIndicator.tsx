
import React from 'react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const steps = [
  { id: AppStep.SEARCH, label: 'Search' },
  { id: AppStep.SELECT_SONG, label: 'Select Song' },
  { id: AppStep.SELECT_LYRICS, label: 'Select Lyrics' },
  { id: AppStep.CUSTOMIZE, label: 'Customize' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center space-x-2 md:space-x-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors ${currentStep >= step.id ? 'bg-brand-green' : 'bg-gray-300 dark:bg-brand-gray-200'}`}>
              {index + 1}
            </div>
            <p className={`ml-2 hidden md:block font-semibold ${currentStep >= step.id ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
              {step.label}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-1 rounded-full transition-colors ${currentStep > step.id ? 'bg-brand-green' : 'bg-gray-300 dark:bg-brand-gray-200'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;