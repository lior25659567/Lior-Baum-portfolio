import React, { useState } from 'react';
import {
    AlertTriangle, CheckCircle, XCircle, BrainCircuit,
    MapPin, Eye, Lightbulb, Filter, Lock
} from 'lucide-react';
import { useApp, ROLES } from '../context/AppContext';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import styles from './FindingsInsights.module.css';

const MOCK_FINDINGS = [
    {
        id: 1,
        title: 'Interproximal Caries Detected',
        location: 'Tooth #14 (UL6)',
        severity: 'High',
        confidence: 98,
        status: 'pending',
        description: 'Distinct radiolucency observed on the distal surface extending into the dentin. Early intervention recommended.',
        aiReasoning: 'Pattern match with 98% confidence against validated caries dataset. Contrast shift >15% detected in radiograph analysis.'
    },
    {
        id: 2,
        title: 'Marginal Discrepancy',
        location: 'Tooth #30 (LR6) Crown',
        severity: 'Medium',
        confidence: 85,
        status: 'confirmed',
        description: 'Open margin detected on the mesial aspect of the existing restoration. Monitor for secondary decay.',
        aiReasoning: 'Step deformity detected in surface mesh topology analysis. Gap measurement: 0.3mm.'
    },
    {
        id: 3,
        title: 'Gingival Recession',
        location: 'Tooth #24 (LL1)',
        severity: 'Medium',
        confidence: 92,
        status: 'dismissed',
        description: 'Gingival margin is 3mm apical to the CEJ. Consider patient history of aggressive brushing.',
        aiReasoning: 'Measured distance from CEJ landmark to soft tissue boundary exceeds normal thresholds by 2.1mm.'
    }
];

const FindingsInsights = () => {
    const { currentRole, hasPermission, isLocked } = useApp();
    const [selectedFindingId, setSelectedFindingId] = useState(1);
    const [findings, setFindings] = useState(MOCK_FINDINGS);
    const [filter, setFilter] = useState('all');
    const [showEmpty, setShowEmpty] = useState(false); // Demo toggle

    const canConfirmFindings = hasPermission('canConfirmFindings');
    const selectedFinding = findings.find(f => f.id === selectedFindingId);

    const handleStatusUpdate = (id, newStatus) => {
        if (!canConfirmFindings) return;
        setFindings(findings.map(f => f.id === id ? { ...f, status: newStatus } : f));
    };

    const filteredFindings = findings.filter(f => {
        if (filter === 'all') return true;
        return f.status === filter;
    });

    const countByStatus = (status) => findings.filter(f => f.status === status).length;

    // Empty state
    if (showEmpty) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyWrapper}>
                    <EmptyState
                        type="noData"
                        title="No Findings Detected"
                        description="AI analysis did not detect any clinical findings in the uploaded scans."
                        actionLabel="Re-run Analysis"
                        onAction={() => setShowEmpty(false)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.listSection}>
                <div className={styles.header}>
                    <h2>Detected Findings</h2>
                    <p className={styles.summary}>
                        AI analyzed 32 regions and identified {findings.length} potential issues requiring clinical review.
                        {!canConfirmFindings && (
                            <span className={styles.readOnlyNote}>
                                <Lock size={12} /> Read-only access
                            </span>
                        )}
                    </p>
                </div>

                <div className={styles.filterBar}>
                    <button
                        className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        <Filter size={14} />
                        All
                        <span className={styles.filterCount}>{findings.length}</span>
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                        <span className={styles.filterCount}>{countByStatus('pending')}</span>
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'confirmed' ? styles.active : ''}`}
                        onClick={() => setFilter('confirmed')}
                    >
                        Confirmed
                        <span className={styles.filterCount}>{countByStatus('confirmed')}</span>
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'dismissed' ? styles.active : ''}`}
                        onClick={() => setFilter('dismissed')}
                    >
                        Dismissed
                        <span className={styles.filterCount}>{countByStatus('dismissed')}</span>
                    </button>

                    {/* Demo toggle */}
                    <button
                        className={styles.filterBtn}
                        onClick={() => setShowEmpty(true)}
                        style={{ marginLeft: 'auto', opacity: 0.5, fontSize: '11px' }}
                    >
                        (Demo: Empty)
                    </button>
                </div>

                {filteredFindings.map((finding, index) => (
                    <div
                        key={finding.id}
                        className={`
               ${styles.findingCard} 
               ${selectedFindingId === finding.id ? styles.active : ''}
               ${finding.severity === 'High' ? styles.highPriority : styles.mediumPriority}
             `}
                        onClick={() => setSelectedFindingId(finding.id)}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>
                                <span className={`${styles.badge} ${finding.severity === 'High' ? styles.badgeHigh : styles.badgeMedium}`}>
                                    {finding.severity}
                                </span>
                                {finding.title}
                            </span>
                            {finding.status === 'confirmed' && (
                                <div className={`${styles.statusIcon} ${styles.confirmed}`}>
                                    <CheckCircle size={14} />
                                </div>
                            )}
                            {finding.status === 'dismissed' && (
                                <div className={`${styles.statusIcon} ${styles.dismissed}`}>
                                    <XCircle size={14} />
                                </div>
                            )}
                        </div>

                        <div className={styles.cardMeta}>
                            <span className={styles.metaItem}>
                                <MapPin size={14} /> {finding.location}
                            </span>
                        </div>

                        <p className={styles.cardDescription}>{finding.description}</p>

                        <div className={styles.confidenceBar}>
                            <span className={styles.confidenceLabel}>AI Confidence</span>
                            <div className={styles.confidenceTrack}>
                                <div className={styles.confidenceFill} style={{ width: `${finding.confidence}%` }} />
                            </div>
                            <span className={styles.confidenceValue}>{finding.confidence}%</span>
                        </div>

                        <div className={styles.actions}>
                            <Button
                                size="sm"
                                variant={finding.status === 'confirmed' ? 'primary' : 'secondary'}
                                icon={<CheckCircle size={14} />}
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(finding.id, 'confirmed'); }}
                                disabled={!canConfirmFindings || isLocked()}
                            >
                                Confirm
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                icon={<XCircle size={14} />}
                                style={{ opacity: finding.status === 'dismissed' ? 0.5 : 1 }}
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(finding.id, 'dismissed'); }}
                                disabled={!canConfirmFindings || isLocked()}
                            >
                                Dismiss
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                icon={<Eye size={14} />}
                                onClick={(e) => { e.stopPropagation(); }}
                            >
                                View in Scan
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.detailsSection}>
                {selectedFinding ? (
                    <>
                        <div className={styles.detailHeader}>
                            <h3>{selectedFinding.title}</h3>
                            <p className={styles.summary}>{selectedFinding.location}</p>
                        </div>

                        <div className={styles.detailImage}>
                            <AlertTriangle size={48} color="var(--color-warning)" />
                        </div>

                        <div className={styles.detailSection}>
                            <h4><BrainCircuit size={14} /> AI Analysis</h4>
                            <p>{selectedFinding.aiReasoning}</p>
                        </div>

                        <div className={styles.detailSection}>
                            <h4><Lightbulb size={14} /> Clinical Implications</h4>
                            <p>
                                {selectedFinding.severity === 'High'
                                    ? 'Untreated progression may lead to pulpal involvement. Early intervention strongly recommended.'
                                    : 'Monitor condition during next scheduled visit. Document progression if any.'}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <Eye size={28} />
                        </div>
                        <p>Select a finding to view detailed analysis</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindingsInsights;
