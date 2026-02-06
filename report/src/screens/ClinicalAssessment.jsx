import { useState } from 'react';
import { useApp, ROLES, STATUS } from '../context/AppContext';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LockedOverlay from '../components/LockedOverlay';
import {
    Check, X, AlertTriangle, MapPin, Sparkles,
    FileText, Stethoscope, Plus, Lock
} from 'lucide-react';
import styles from './ClinicalAssessment.module.css';

const ClinicalAssessment = () => {
    const { currentRole, hasPermission, isLocked } = useApp();
    const [selectedFinding, setSelectedFinding] = useState(0);
    const [hasFindings, setHasFindings] = useState(true);

    const canConfirmFindings = hasPermission('canConfirmFindings');
    const canEditRecommendations = hasPermission('canEditRecommendations') && !isLocked();

    // Mock findings data
    const [findings, setFindings] = useState([
        {
            id: 1,
            title: 'Interproximal Cavity #14',
            priority: 'high',
            location: 'Tooth #14 - Mesial',
            description: 'Radiolucent area detected on mesial surface suggesting early caries formation.',
            confidence: 94,
            status: 'pending',
            recommendation: 'Recommend Class II composite restoration with careful proximal contact establishment.'
        },
        {
            id: 2,
            title: 'Periapical Radiolucency #19',
            priority: 'high',
            location: 'Tooth #19 - Apex',
            description: 'Periapical radiolucency approximately 3mm diameter consistent with chronic periapical abscess.',
            confidence: 91,
            status: 'confirmed',
            recommendation: 'Root canal therapy recommended. Consider referral to endodontist for complex root anatomy.'
        },
        {
            id: 3,
            title: 'Bone Loss Pattern',
            priority: 'medium',
            location: 'Posterior Mandible',
            description: 'Generalized horizontal bone loss pattern observed in posterior regions.',
            confidence: 87,
            status: 'pending',
            recommendation: 'Periodontal evaluation recommended. Consider scaling and root planing.'
        },
        {
            id: 4,
            title: 'Crown Margin Discrepancy',
            priority: 'medium',
            location: 'Tooth #30',
            description: 'Open margin detected on distal aspect of existing crown.',
            confidence: 82,
            status: 'dismissed',
            recommendation: 'Monitor or consider crown replacement if symptomatic.'
        },
    ]);

    // Track recommendation edits
    const [recommendations, setRecommendations] = useState(
        findings.reduce((acc, f) => ({ ...acc, [f.id]: f.recommendation }), {})
    );

    const handleConfirm = (id) => {
        if (!canConfirmFindings) return;
        setFindings(findings.map(f =>
            f.id === id ? { ...f, status: 'confirmed' } : f
        ));
    };

    const handleDismiss = (id) => {
        if (!canConfirmFindings) return;
        setFindings(findings.map(f =>
            f.id === id ? { ...f, status: 'dismissed' } : f
        ));
    };

    const handleRecommendationChange = (id, value) => {
        if (!canEditRecommendations) return;
        setRecommendations({ ...recommendations, [id]: value });
    };

    // Lab users cannot see recommendations
    if (currentRole === ROLES.LAB) {
        return (
            <div className={styles.container}>
                <div className={styles.restrictedAccess}>
                    <div className={styles.restrictedIcon}>
                        <Lock size={32} />
                    </div>
                    <h3>Clinical Assessment</h3>
                    <p>This section is for clinical staff only.</p>
                </div>
            </div>
        );
    }

    const activeFinding = findings[selectedFinding];
    const confirmedCount = findings.filter(f => f.status === 'confirmed').length;
    const pendingCount = findings.filter(f => f.status === 'pending').length;

    if (!hasFindings) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyWrapper}>
                    <EmptyState
                        type="noData"
                        title="No Findings Detected"
                        description="AI analysis did not detect any significant findings in the scan."
                    />
                </div>
                <button className={styles.demoToggle} onClick={() => setHasFindings(true)}>
                    Toggle Findings (Demo)
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>Clinical Assessment</h2>
                    <p className={styles.summary}>
                        {confirmedCount} confirmed, {pendingCount} pending review
                    </p>
                </div>
                {!canConfirmFindings && (
                    <span className={styles.readOnlyBadge}>
                        <Lock size={12} /> Read-only
                    </span>
                )}
            </div>

            {/* Split View */}
            <div className={styles.splitView}>
                {/* Left: Findings List */}
                <div className={styles.findingsPanel}>
                    <div className={styles.panelHeader}>
                        <Sparkles size={16} />
                        <span>AI Findings</span>
                        <span className={styles.countBadge}>{findings.length}</span>
                    </div>

                    <div className={styles.findingsList}>
                        {findings.map((finding, index) => (
                            <div
                                key={finding.id}
                                className={`${styles.findingCard} ${selectedFinding === index ? styles.active : ''} ${finding.priority === 'high' ? styles.highPriority : styles.mediumPriority}`}
                                onClick={() => setSelectedFinding(index)}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardTitle}>{finding.title}</span>
                                    {finding.status === 'confirmed' && (
                                        <span className={`${styles.statusIcon} ${styles.confirmed}`}>
                                            <Check size={12} />
                                        </span>
                                    )}
                                    {finding.status === 'dismissed' && (
                                        <span className={`${styles.statusIcon} ${styles.dismissed}`}>
                                            <X size={12} />
                                        </span>
                                    )}
                                </div>
                                <div className={styles.cardMeta}>
                                    <span className={styles.metaItem}>
                                        <MapPin size={12} />
                                        {finding.location}
                                    </span>
                                </div>
                                <div className={styles.confidenceBar}>
                                    <span className={styles.confidenceLabel}>Confidence</span>
                                    <div className={styles.confidenceTrack}>
                                        <div
                                            className={styles.confidenceFill}
                                            style={{ width: `${finding.confidence}%` }}
                                        />
                                    </div>
                                    <span className={styles.confidenceValue}>{finding.confidence}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Detail + Recommendation */}
                <div className={styles.detailPanel}>
                    {activeFinding && (
                        <>
                            {/* Finding Detail */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionTitle}>
                                        <Stethoscope size={16} />
                                        <span>Finding Detail</span>
                                    </div>
                                    <span className={`${styles.priorityBadge} ${activeFinding.priority === 'high' ? styles.high : styles.medium}`}>
                                        {activeFinding.priority} priority
                                    </span>
                                </div>

                                <h3 className={styles.findingTitle}>{activeFinding.title}</h3>
                                <p className={styles.findingLocation}>
                                    <MapPin size={14} />
                                    {activeFinding.location}
                                </p>
                                <p className={styles.findingDescription}>
                                    {activeFinding.description}
                                </p>

                                {/* Actions */}
                                <div className={styles.findingActions}>
                                    <Button
                                        variant={activeFinding.status === 'confirmed' ? 'primary' : 'secondary'}
                                        onClick={() => handleConfirm(activeFinding.id)}
                                        disabled={!canConfirmFindings || isLocked()}
                                    >
                                        <Check size={16} />
                                        {activeFinding.status === 'confirmed' ? 'Confirmed' : 'Confirm'}
                                    </Button>
                                    <Button
                                        variant={activeFinding.status === 'dismissed' ? 'danger' : 'ghost'}
                                        onClick={() => handleDismiss(activeFinding.id)}
                                        disabled={!canConfirmFindings || isLocked()}
                                    >
                                        <X size={16} />
                                        {activeFinding.status === 'dismissed' ? 'Dismissed' : 'Dismiss'}
                                    </Button>
                                </div>
                            </div>

                            {/* Recommendation */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionTitle}>
                                        <FileText size={16} />
                                        <span>Treatment Recommendation</span>
                                    </div>
                                    {!canEditRecommendations && (
                                        <span className={styles.readOnlyNote}>
                                            <Lock size={12} /> Read-only
                                        </span>
                                    )}
                                </div>

                                <div className={styles.recommendationBox}>
                                    {isLocked() && <LockedOverlay message="Report Approved" />}
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>
                                            <Sparkles size={12} />
                                            AI Generated Recommendation
                                        </label>
                                        <textarea
                                            className={styles.textArea}
                                            value={recommendations[activeFinding.id] || ''}
                                            onChange={(e) => handleRecommendationChange(activeFinding.id, e.target.value)}
                                            disabled={!canEditRecommendations}
                                            placeholder="Enter treatment recommendation..."
                                        />
                                    </div>

                                    {canEditRecommendations && (
                                        <div className={styles.quickActions}>
                                            <span className={styles.quickLabel}>Quick add:</span>
                                            <button className={styles.templateChip}>Follow-up 6 months</button>
                                            <button className={styles.templateChip}>Refer to specialist</button>
                                            <button className={styles.templateChip}>Urgent attention</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Demo toggle */}
            <button className={styles.demoToggle} onClick={() => setHasFindings(!hasFindings)}>
                Toggle Empty State (Demo)
            </button>
        </div>
    );
};

export default ClinicalAssessment;
