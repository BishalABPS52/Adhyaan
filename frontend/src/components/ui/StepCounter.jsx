'use client';

import React from 'react';
import styles from './StepCounter.module.css';

const StepCounter = ({ currentStep, onStepClick }) => {
  const steps = [
    {
      number: 1,
      title: 'Select Board',
      subtitle: 'Choose your institution'
    },
    {
      number: 2,
      title: 'Choose Course',
      subtitle: 'Select your course or program'
    },
    {
      number: 3,
      title: 'Pick Year & Semester',
      subtitle: 'Select academic period'
    },
    {
      number: 4,
      title: 'Select Subject',
      subtitle: 'Choose your subject'
    },
    {
      number: 5,
      title: 'Browse Books',
      subtitle: 'Explore resources'
    }
  ];

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return '';
  };

  const getConnectorStatus = (stepIndex) => {
    return stepIndex < currentStep ? 'completed' : '';
  };

  return (
    <div className={styles.stepperContainer}>
      <div className={styles.stepperWrapper}>
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div
              className={`${styles.stepCard} ${styles[getStepStatus(index)]}`}
              onClick={() => onStepClick && onStepClick(index)}
            >
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepTitle}>{step.title}</div>
              <div className={styles.stepSubtitle}>{step.subtitle}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`${styles.connector} ${styles[getConnectorStatus(index)]}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepCounter;