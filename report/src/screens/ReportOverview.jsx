import React from 'react';
import {
    Shield, CheckCircle, Clock, AlertTriangle,
    User, Calendar, Scan, TrendingUp
} from 'lucide-react';
import { useApp, STATUS, ROLES, STATUS_CONFIG } from '../context/AppContext';
import styles from './ReportOverview.module.css';

const ReportOverview = () => {
    const { reportStatus, currentRole, isLocked } = useApp();
    const statusConfig = STATUS_CONFIG[reportStatus];

    return (
        <div className={styles.overview}>
            <div className={styles.card}>
                <div className={styles.pageHeader}>
                    <div className={styles.titleSection}>
                        <h2>Clinical Report Summary</h2>
                        <p className={styles.subtitle}>AI-assisted analysis of intraoral scan data</p>
                    </div>
                    <div
                        className={styles.statusChip}
                        style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                    >
                        <Shield size={14} />
                        {statusConfig.label}
                    </div>
                </div>

                {/* Role-specific notice */}
                {currentRole === ROLES.LAB && reportStatus === STATUS.REVISED && (
                    <div className={styles.alertCard}>
                        <AlertTriangle className={styles.alertIcon} size={20} />
                        <div className={styles.alertContent}>
                            <h4>Revision Requested</h4>
                            <p>The reviewing doctor has requested changes to this report. Please review the comments and update accordingly.</p>
                        </div>
                    </div>
                )}

                {currentRole === ROLES.ASSISTANT && (
                    <div className={styles.alertCard} style={{ background: '#F0F7FF', borderColor: '#BAE6FD' }}>
                        <AlertTriangle className={styles.alertIcon} size={20} style={{ color: 'var(--color-primary)' }} />
                        <div className={styles.alertContent}>
                            <h4 style={{ color: 'var(--color-primary-dark)' }}>View-Only Access</h4>
                            <p style={{ color: 'var(--color-primary)' }}>You have read-only access to this report. Contact the supervising doctor for changes.</p>
                        </div>
                    </div>
                )}

                <div className={styles.grid}>
                    <div className={styles.metricCard}>
                        <div className={`${styles.metricIcon} ${styles.iconSuccess}`}>
                            <CheckCircle size={18} />
                        </div>
                        <span className={styles.metricLabel}>AI Confidence</span>
                        <span className={styles.metricValue}>94%</span>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: '94%' }} />
                        </div>
                    </div>

                    <div className={styles.metricCard}>
                        <div className={`${styles.metricIcon} ${styles.iconPrimary}`}>
                            <TrendingUp size={18} />
                        </div>
                        <span className={styles.metricLabel}>Completeness</span>
                        <span className={styles.metricValue}>87%</span>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: '87%' }} />
                        </div>
                    </div>

                    <div className={styles.metricCard}>
                        <div className={`${styles.metricIcon} ${styles.iconWarning}`}>
                            <Clock size={18} />
                        </div>
                        <span className={styles.metricLabel}>Review Time</span>
                        <span className={styles.metricValue}>~8 min</span>
                        <span className={styles.metricSub}>Estimated remaining</span>
                    </div>
                </div>

                <div className={styles.metadataSection}>
                    <div className={styles.metaGroup}>
                        <h3><User size={16} /> Patient Information</h3>
                        <div className={styles.metaList}>
                            <div className={styles.metaItem}>
                                <span className={styles.label}>Full Name</span>
                                <span className={styles.value}>Sarah M. Jenkins</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.label}>Patient ID</span>
                                <span className={styles.value}>PT-83921</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.label}>Date of Birth</span>
                                <span className={styles.value}>March 15, 1992</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.label}>Treatment</span>
                                <span className={styles.value}>Clear Aligner Therapy</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.metaGroup}>
                        <h3><Scan size={16} /> Scan Metadata</h3>
                        <div className={styles.metaList}>
                            <div className={styles.metaItem}>
                                <span className={styles.label}>Scan Date</span>
                                <span className={styles.value}>October 24, 2024</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.label}>Scanner Model</span>
                                <span className={styles.value}>iTero Element 5D</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.label}>Technician</span>
                                <span className={styles.value}>Mark Thompson</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.label}>Quality Score</span>
                                <span className={styles.value}>Excellent (98/100)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportOverview;
