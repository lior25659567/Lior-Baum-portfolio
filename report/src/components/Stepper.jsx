import React from 'react';
import { Check } from 'lucide-react';
import styles from './Stepper.module.css';

const Stepper = ({ steps, currentStep, onStepClick }) => {
    // Calculate progress line width
    const progressWidth = currentStep === 0 ? 0 : ((currentStep) / (steps.length - 1)) * 100;

    const handleStepClick = (index) => {
        if (onStepClick) {
            onStepClick(index);
        }
    };

    return (
        <div className={styles.stepper}>
            <div
                className={styles.progressLine}
                style={{ width: `calc(${progressWidth}% - 40px)` }}
            />
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                const isClickable = onStepClick !== undefined;

                return (
                    <div
                        key={index}
                        className={`
              ${styles.step} 
              ${isActive ? styles.active : ''} 
              ${isCompleted ? styles.completed : ''}
              ${isClickable ? styles.clickable : ''}
            `}
                        onClick={() => handleStepClick(index)}
                    >
                        <div className={styles.indicator}>
                            {isCompleted ? <Check size={16} strokeWidth={3} /> : index + 1}
                        </div>
                        <span className={styles.label}>{step.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default Stepper;
