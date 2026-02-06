import React, { useState } from 'react';
import {
    Sparkles, AlertTriangle, FileText, Plus,
    Pencil, Stethoscope, Pill, Lock, EyeOff
} from 'lucide-react';
import { useApp, ROLES } from '../context/AppContext';
import Button from '../components/Button';
import LockedOverlay from '../components/LockedOverlay';
import styles from './Recommendations.module.css';

const INITIAL_RECOMMENDATIONS = [
    {
        id: 1,
        title: 'Restorative Treatment - UL6',
        aiProposal: 'Composite Restoration (MO) with selective etching technique. Consider rubber dam isolation for optimal bonding.',
        rationale: 'Conservative approach appropriate given modest decay depth confined to enamel-dentin junction.',
        conflict: null,
        isEdited: false
    },
    {
        id: 2,
        title: 'Periodontal Therapy',
        aiProposal: 'Root Planing - Quadrant 3. Schedule follow-up in 4-6 weeks to assess healing.',
        rationale: 'Pocket depth >4mm observed with clinical attachment loss. Non-surgical treatment indicated.',
        conflict: 'Caution: Patient medical history indicates blood thinner medication. Verify INR levels before procedure.',
        isEdited: false
    }
];

const QUICK_TEMPLATES = [
    'Monitor only',
    'Refer to specialist',
    'Patient education',
    'Preventive treatment'
];

const Recommendations = () => {
    const { currentRole, hasPermission, isLocked } = useApp();
    const [items, setItems] = useState(INITIAL_RECOMMENDATIONS);

    const canEdit = hasPermission('canEditRecommendations');
    const canView = hasPermission('canViewRecommendations');

    // Lab role cannot view recommendations
    if (!canView) {
        return (
            <div className={styles.container}>
                <div className={styles.restrictedAccess}>
                    <div className={styles.restrictedIcon}>
                        <EyeOff size={32} />
                    </div>
                    <h3>Access Restricted</h3>
                    <p>Treatment recommendations are only visible to clinical staff.</p>
                </div>
            </div>
        );
    }

    const handleTextChange = (id, field, value) => {
        if (!canEdit) return;
        setItems(items.map(item =>
            item.id === id
                ? { ...item, [field]: value, isEdited: true }
                : item
        ));
    };

    const applyTemplate = (id, template) => {
        if (!canEdit) return;
        setItems(items.map(item =>
            item.id === id
                ? { ...item, rationale: item.rationale + ` ${template} recommended.`, isEdited: true }
                : item
        ));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Treatment Recommendations</h2>
                <p className={styles.headerSub}>
                    Review AI-generated treatment suggestions and customize as needed.
                    {!canEdit && (
                        <span className={styles.readOnlyBadge}>
                            <Lock size={12} /> Read-only
                        </span>
                    )}
                </p>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>
                        <Stethoscope size={18} />
                        Proposed Treatment Plan
                    </span>
                    {canEdit && !isLocked() && (
                        <Button size="sm" variant="secondary" icon={<Sparkles size={14} />}>
                            Regenerate Suggestions
                        </Button>
                    )}
                </div>

                <div className={styles.sectionContent} style={{ position: 'relative' }}>
                    {isLocked() && (
                        <LockedOverlay
                            message="Report Approved"
                            reason="This report has been finalized and cannot be edited."
                        />
                    )}

                    {items.map((item) => (
                        <div key={item.id} className={styles.recommendationItem}>
                            <div className={styles.itemHeader}>
                                <span className={styles.itemTitle}>{item.title}</span>
                                <div className={styles.itemMeta}>
                                    {item.isEdited && (
                                        <span className={styles.editedBadge}>
                                            <Pencil size={10} /> Edited
                                        </span>
                                    )}
                                    <span className={styles.aiBadge}>
                                        <Sparkles size={10} /> AI Suggested
                                    </span>
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    <Pill size={14} /> Treatment Protocol
                                </label>
                                <textarea
                                    className={styles.textArea}
                                    value={item.aiProposal}
                                    onChange={(e) => handleTextChange(item.id, 'aiProposal', e.target.value)}
                                    placeholder="Describe the recommended treatment..."
                                    disabled={!canEdit || isLocked()}
                                    style={{ opacity: canEdit ? 1 : 0.7 }}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    <FileText size={14} /> Clinical Rationale
                                </label>
                                <textarea
                                    className={`${styles.textArea} ${styles.rationaleInput}`}
                                    value={item.rationale}
                                    onChange={(e) => handleTextChange(item.id, 'rationale', e.target.value)}
                                    placeholder="Explain the clinical reasoning..."
                                    disabled={!canEdit || isLocked()}
                                    style={{ opacity: canEdit ? 1 : 0.7 }}
                                />
                            </div>

                            {canEdit && !isLocked() && (
                                <div className={styles.quickActions}>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginRight: '8px' }}>
                                        Quick add:
                                    </span>
                                    {QUICK_TEMPLATES.map((template) => (
                                        <button
                                            key={template}
                                            className={styles.templateChip}
                                            onClick={() => applyTemplate(item.id, template)}
                                        >
                                            {template}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {item.conflict && (
                                <div className={styles.conflictAlert}>
                                    <AlertTriangle className={styles.alertIcon} size={20} />
                                    <div className={styles.alertContent}>
                                        <strong>Potential Conflict Detected</strong>
                                        <p>{item.conflict}</p>
                                        {canEdit && !isLocked() && (
                                            <div className={styles.alertActions}>
                                                <Button size="sm" variant="secondary">Acknowledge Risk</Button>
                                                <Button size="sm" variant="ghost">View Patient History</Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {canEdit && !isLocked() && (
                        <div className={styles.addSection}>
                            <Plus size={18} style={{ marginRight: '8px' }} />
                            Add Custom Recommendation
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Recommendations;
