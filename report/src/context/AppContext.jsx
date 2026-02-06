import React, { createContext, useContext, useState } from 'react';

// Role definitions
export const ROLES = {
    DOCTOR: 'doctor',
    ASSISTANT: 'assistant',
    LAB: 'lab'
};

// Report status definitions
export const STATUS = {
    DRAFT: 'draft',
    IN_REVIEW: 'in_review',
    APPROVED: 'approved',
    REVISED: 'revised'
};

// Role display names
export const ROLE_LABELS = {
    [ROLES.DOCTOR]: 'Doctor',
    [ROLES.ASSISTANT]: 'Assistant',
    [ROLES.LAB]: 'Lab Technician'
};

// Status display names and colors - Semantic colors for states
export const STATUS_CONFIG = {
    [STATUS.DRAFT]: { label: 'Draft', color: '#6B7280', bg: '#F3F4F6' },
    [STATUS.IN_REVIEW]: { label: 'In Review', color: '#D97706', bg: '#FEF3C7' },
    [STATUS.APPROVED]: { label: 'Approved', color: '#059669', bg: '#D1FAE5' },
    [STATUS.REVISED]: { label: 'Revision Requested', color: '#DC2626', bg: '#FEE2E2' }
};

// Permission matrix
const PERMISSIONS = {
    canViewOverview: [ROLES.DOCTOR, ROLES.ASSISTANT, ROLES.LAB],
    canViewEvidence: [ROLES.DOCTOR, ROLES.ASSISTANT, ROLES.LAB],
    canEditAnnotations: [ROLES.DOCTOR, ROLES.LAB],
    canViewFindings: [ROLES.DOCTOR, ROLES.ASSISTANT, ROLES.LAB],
    canConfirmFindings: [ROLES.DOCTOR],
    canViewRecommendations: [ROLES.DOCTOR, ROLES.ASSISTANT],
    canEditRecommendations: [ROLES.DOCTOR],
    canApproveReport: [ROLES.DOCTOR],
    canRequestRevision: [ROLES.DOCTOR, ROLES.ASSISTANT],
    canSubmitForReview: [ROLES.LAB],
    canEditInDraft: [ROLES.LAB],
    canEditInRevised: [ROLES.LAB]
};

// Create context
const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [currentRole, setCurrentRole] = useState(ROLES.DOCTOR);
    const [reportStatus, setReportStatus] = useState(STATUS.IN_REVIEW);

    // Mock data for warnings
    const [warnings, setWarnings] = useState([
        { id: 1, type: 'warning', message: '2 findings require clinical review', dismissible: true },
    ]);

    // Check if current role has a specific permission
    const hasPermission = (permission) => {
        const allowedRoles = PERMISSIONS[permission];
        if (!allowedRoles) return false;
        return allowedRoles.includes(currentRole);
    };

    // Check if content is editable based on status and role
    const isEditable = () => {
        if (reportStatus === STATUS.APPROVED) return false;
        if (reportStatus === STATUS.DRAFT && currentRole === ROLES.LAB) return true;
        if (reportStatus === STATUS.REVISED && currentRole === ROLES.LAB) return true;
        if (reportStatus === STATUS.IN_REVIEW && currentRole === ROLES.DOCTOR) return true;
        return false;
    };

    // Check if report is locked (read-only)
    const isLocked = () => {
        return reportStatus === STATUS.APPROVED;
    };

    // Dismiss a warning
    const dismissWarning = (id) => {
        setWarnings(warnings.filter(w => w.id !== id));
    };

    // Status transitions
    const submitForReview = () => {
        if (hasPermission('canSubmitForReview')) {
            setReportStatus(STATUS.IN_REVIEW);
        }
    };

    const approveReport = () => {
        if (hasPermission('canApproveReport')) {
            setReportStatus(STATUS.APPROVED);
        }
    };

    const requestRevision = () => {
        if (hasPermission('canRequestRevision')) {
            setReportStatus(STATUS.REVISED);
        }
    };

    const value = {
        currentRole,
        setCurrentRole,
        reportStatus,
        setReportStatus,
        warnings,
        dismissWarning,
        hasPermission,
        isEditable,
        isLocked,
        submitForReview,
        approveReport,
        requestRevision
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export default AppContext;
