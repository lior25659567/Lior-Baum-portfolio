import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/MainLayout';
import ReviewEvidence from './screens/ReviewEvidence';
import ClinicalAssessment from './screens/ClinicalAssessment';
import FinalizeReport from './screens/FinalizeReport';
import './App.css';

// Simplified 3-step flow
const STEPS = [
  { id: 'evidence', label: 'Review Evidence' },
  { id: 'assessment', label: 'Clinical Assessment' },
  { id: 'finalize', label: 'Finalize Report' },
];

function AppContent() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const renderScreen = () => {
    switch (currentStep) {
      case 0: return <ReviewEvidence />;
      case 1: return <ClinicalAssessment />;
      case 2: return <FinalizeReport />;
      default: return <ReviewEvidence />;
    }
  };

  return (
    <MainLayout
      currentStep={currentStep}
      steps={STEPS}
      onNext={handleNext}
      onBack={handleBack}
      onStepClick={handleStepClick}
      isFirstStep={currentStep === 0}
      isLastStep={currentStep === STEPS.length - 1}
    >
      {renderScreen()}
    </MainLayout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

