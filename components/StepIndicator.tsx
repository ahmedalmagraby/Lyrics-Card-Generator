import React from 'react';
import { AppStep } from '../types';
import { CheckIcon } from './Icons';

interface StepIndicatorProps {
  currentStep: AppStep;
  onStepClick: (step: AppStep) => void;
}

const steps = [
  { id: AppStep.SEARCH, label: 'Find a song' },
  { id: AppStep.SELECT_LYRICS, label: 'Pick lyrics' },
  { id: AppStep.CUSTOMIZE, label: 'Design card' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => (
  <nav aria-label="Progress">
    <ol className="flex items-center max-w-xl mx-auto">
      {steps.map((step, index) => {
        const done = currentStep > step.id;
        const current = currentStep === step.id;
        return (
          <li key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              disabled={!done}
              aria-current={current ? 'step' : undefined}
              className="flex items-center gap-2 rounded-full disabled:cursor-default group"
            >
              <span
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  done
                    ? 'bg-brand-green-dark text-white group-hover:bg-green-800'
                    : current
                      ? 'bg-brand-green-dark text-white ring-4 ring-brand-green/25'
                      : 'bg-gray-200 text-gray-500 dark:bg-brand-gray-300 dark:text-brand-gray-100'
                }`}
              >
                {done ? <CheckIcon className="w-4 h-4" /> : index + 1}
              </span>
              <span
                className={`text-sm font-semibold whitespace-nowrap ${current ? '' : 'hidden sm:inline'} ${
                  done || current ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                } ${done ? 'group-hover:underline' : ''}`}
              >
                {step.label}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                aria-hidden="true"
                className={`flex-1 h-0.5 mx-3 rounded-full transition-colors ${
                  done ? 'bg-brand-green-dark' : 'bg-gray-200 dark:bg-brand-gray-300'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default StepIndicator;
