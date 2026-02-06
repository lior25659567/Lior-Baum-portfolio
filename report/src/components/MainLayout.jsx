import React from 'react';
import { Activity, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useApp, STATUS, ROLES } from '../context/AppContext';
import Stepper from './Stepper';
import Button from './Button';
import RoleSwitcher from './RoleSwitcher';
import StatusBadge from './StatusBadge';
import SystemWarning from './SystemWarning';
import styles from './MainLayout.module.css';

const MainLayout = ({
    children,
    currentStep,
    steps,
    onNext,
    onBack,
    onStepClick,
    isFirstStep,
    isLastStep
}) => {
    const {
        currentRole,
        reportStatus,
        warnings,
        dismissWarning,
        hasPermission,
        isLocked
    } = useApp();

    // Filter steps based on role permissions
    const canViewRecommendations = hasPermission('canViewRecommendations');
    const visibleSteps = steps.filter((step, index) => {
        if (index === 3 && !canViewRecommendations) return false; // Recommendations
        return true;
    });

    // Get action button text based on role and status
    const getActionButton = () => {
        if (isLocked()) {
            return { label: 'Report Finalized', disabled: true };
        }
        if (isLastStep) {
            if (currentRole === ROLES.DOCTOR) {
                return { label: 'Approve & Finalize', disabled: false };
            }
            if (currentRole === ROLES.LAB && reportStatus === STATUS.DRAFT) {
                return { label: 'Submit for Review', disabled: false };
            }
            if (currentRole === ROLES.LAB && reportStatus === STATUS.REVISED) {
                return { label: 'Resubmit for Review', disabled: false };
            }
            return { label: 'Continue', disabled: true };
        }
        return { label: 'Continue', disabled: false };
    };

    const actionButton = getActionButton();

    return (
        <div className={styles.layout}>
            {/* Top Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.brand}>
                        <div className={styles.brandIcon}>
                            <Activity size={20} />
                        </div>
                        <span>OrthoReport AI</span>
                    </div>
                    <div className={styles.patientInfo}>
                        <span className={styles.patientName}>Sarah Jenkins (PT-83921)</span>
                        <span className={styles.patientMeta}>Clear Aligner Therapy • Scan: Oct 24, 2024</span>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <StatusBadge editable={true} />
                    <div className={styles.divider} />
                    <span className={styles.saveStatus}>
                        <Check size={14} /> Auto-saved
                    </span>
                    <RoleSwitcher />
                </div>
            </header>

            {/* System Warnings */}
            {warnings.length > 0 && (
                <div className={styles.warningsContainer}>
                    {warnings.map((warning) => (
                        <SystemWarning
                            key={warning.id}
                            type={warning.type}
                            message={warning.message}
                            dismissible={warning.dismissible}
                            onDismiss={() => dismissWarning(warning.id)}
                        />
                    ))}
                </div>
            )}

            {/* Locked Banner */}
            {isLocked() && (
                <div className={styles.lockedBanner}>
                    <span>🔒 This report has been approved and is now read-only</span>
                </div>
            )}

            {/* Main Content Area */}
            <main className={styles.container}>
                <Stepper steps={steps} currentStep={currentStep} onStepClick={onStepClick} />
                <div className={styles.pageContent} key={currentStep}>
                    {children}
                </div>
            </main>

            {/* Action Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerLeft}>
                    {!isFirstStep && (
                        <Button variant="secondary" onClick={onBack} icon={<ChevronLeft size={18} />}>
                            Previous
                        </Button>
                    )}
                    <span className={styles.stepInfo}>
                        Step <strong>{currentStep + 1}</strong> of <strong>{steps.length}</strong>
                    </span>
                </div>
                <div className={styles.footerRight}>
                    {currentRole === ROLES.DOCTOR && reportStatus === STATUS.IN_REVIEW && !isLastStep && (
                        <Button variant="ghost" style={{ color: 'var(--color-danger)' }}>
                            Request Revision
                        </Button>
                    )}
                    <Button
                        variant="primary"
                        onClick={onNext}
                        disabled={actionButton.disabled}
                    >
                        {actionButton.label}
                        {!isLastStep && !actionButton.disabled && <ChevronRight size={18} />}
                    </Button>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
