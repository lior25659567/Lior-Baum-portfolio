import { useState } from 'react';
import { useApp, ROLES, STATUS, STATUS_CONFIG } from '../context/AppContext';
import Button from '../components/Button';
import {
    CheckCircle, Clock, FileText, Download, Share2,
    Printer, History, Shield, AlertTriangle, Send
} from 'lucide-react';
import styles from './FinalizeReport.module.css';

const FinalizeReport = () => {
    const {
        currentRole, reportStatus, hasPermission, isLocked,
        approveReport, requestRevision, submitForReview
    } = useApp();

    const [isSigned, setIsSigned] = useState(false);

    const canApprove = hasPermission('canApproveReport');
    const canSubmit = hasPermission('canSubmitForReview');
    const canRequestRevision = hasPermission('canRequestRevision');

    // Mock summary data
    const summary = {
        findings: { total: 8, confirmed: 6, dismissed: 2 },
        recommendations: 6,
        lastModified: 'Jan 28, 2024 at 3:45 PM',
        preparedBy: 'Lab Tech: Alex Kim'
    };

    const auditLog = [
        { time: '15:45:23', message: 'Report submitted for review', type: 'info' },
        { time: '14:32:10', message: 'AI analysis completed', type: 'success' },
        { time: '14:30:55', message: 'Scan uploaded', type: 'info' },
    ];

    // Lab View - Submit for Review
    if (currentRole === ROLES.LAB) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={`${styles.iconWrapper} ${styles.iconPending}`}>
                            <Send size={32} />
                        </div>
                        <h2 className={styles.title}>Submit for Review</h2>
                        <p className={styles.description}>
                            Your analysis is complete. Submit this report for clinical review.
                        </p>
                    </div>

                    <div className={styles.summarySection}>
                        <div className={styles.summaryTitle}>Report Summary</div>
                        <div className={styles.summaryRow}>
                            <span className={styles.rowLabel}>Findings detected</span>
                            <span className={styles.rowValue}>{summary.findings.total}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.rowLabel}>Last modified</span>
                            <span className={styles.rowValue}>{summary.lastModified}</span>
                        </div>
                    </div>

                    {reportStatus === STATUS.REVISED && (
                        <div className={styles.revisionBanner}>
                            <AlertTriangle size={18} />
                            <span>Revision requested by clinician. Please review and resubmit.</span>
                        </div>
                    )}

                    <Button
                        variant="primary"
                        fullWidth
                        onClick={submitForReview}
                        disabled={reportStatus === STATUS.IN_REVIEW}
                    >
                        <Send size={16} />
                        {reportStatus === STATUS.IN_REVIEW ? 'Submitted for Review' : 'Submit for Review'}
                    </Button>
                </div>
            </div>
        );
    }

    // Assistant View - Read Only
    if (currentRole === ROLES.ASSISTANT) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={`${styles.iconWrapper} ${isLocked() ? styles.iconSuccess : styles.iconPending}`}>
                            {isLocked() ? <CheckCircle size={32} /> : <Clock size={32} />}
                        </div>
                        <h2 className={styles.title}>
                            {isLocked() ? 'Report Approved' : 'Awaiting Approval'}
                        </h2>
                        <p className={styles.description}>
                            {isLocked()
                                ? 'This report has been approved and signed by the clinician.'
                                : 'This report is pending clinical approval.'}
                        </p>
                    </div>

                    <div className={styles.summarySection}>
                        <div className={styles.summaryTitle}>Report Summary</div>
                        <div className={styles.summaryRow}>
                            <span className={styles.rowLabel}>Confirmed findings</span>
                            <span className={styles.rowValue}>{summary.findings.confirmed}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.rowLabel}>Recommendations</span>
                            <span className={styles.rowValue}>{summary.recommendations}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.rowLabel}>Prepared by</span>
                            <span className={styles.rowValue}>{summary.preparedBy}</span>
                        </div>
                    </div>

                    {!isLocked() && canRequestRevision && (
                        <Button variant="secondary" fullWidth onClick={requestRevision}>
                            <AlertTriangle size={16} />
                            Request Revision
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Doctor View - Full Approval Flow
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={`${styles.iconWrapper} ${isLocked() ? styles.iconSuccess : styles.iconPending}`}>
                        {isLocked() ? <CheckCircle size={32} /> : <Shield size={32} />}
                    </div>
                    <h2 className={styles.title}>
                        {isLocked() ? 'Report Finalized' : 'Finalize Report'}
                    </h2>
                    <p className={styles.description}>
                        {isLocked()
                            ? 'This report has been approved and is now part of the patient record.'
                            : 'Review the summary and approve this clinical report.'}
                    </p>
                </div>

                {/* Summary */}
                <div className={styles.summarySection}>
                    <div className={styles.summaryTitle}>Report Summary</div>
                    <div className={styles.summaryRow}>
                        <span className={styles.rowLabel}>
                            <CheckCircle size={14} /> Confirmed findings
                        </span>
                        <span className={styles.rowValue}>{summary.findings.confirmed}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span className={styles.rowLabel}>
                            <FileText size={14} /> Recommendations
                        </span>
                        <span className={styles.rowValue}>{summary.recommendations}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span className={styles.rowLabel}>Prepared by</span>
                        <span className={styles.rowValue}>{summary.preparedBy}</span>
                    </div>
                </div>

                {/* Signature */}
                {!isLocked() ? (
                    <>
                        <div
                            className={`${styles.signatureBox} ${isSigned ? styles.signed : ''}`}
                            onClick={() => setIsSigned(true)}
                        >
                            {isSigned ? (
                                <>
                                    <div className={styles.signatureLabel}>Digitally Signed</div>
                                    <div className={styles.signatureName}>Dr. Michael Chen, DDS</div>
                                    <div className={styles.signatureTime}>
                                        {new Date().toLocaleString()}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.signatureLabel}>Click to sign</div>
                                    <div className={styles.signaturePlaceholder}>
                                        Dr. Michael Chen, DDS
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.buttonRow}>
                            <Button
                                variant="primary"
                                onClick={approveReport}
                                disabled={!isSigned}
                            >
                                <CheckCircle size={16} />
                                Approve & Finalize
                            </Button>
                            <Button variant="secondary" onClick={requestRevision}>
                                <AlertTriangle size={16} />
                                Request Revision
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={`${styles.signatureBox} ${styles.signed}`}>
                            <div className={styles.signatureLabel}>Digitally Signed</div>
                            <div className={styles.signatureName}>Dr. Michael Chen, DDS</div>
                            <div className={styles.signatureTime}>Jan 28, 2024 at 4:15 PM</div>
                        </div>

                        {/* Post-Approval Actions */}
                        <div className={styles.actionGrid}>
                            <button className={styles.actionCard}>
                                <div className={styles.actionIcon}><Download size={20} /></div>
                                <div className={styles.actionText}>
                                    <h4>Download PDF</h4>
                                    <p>Export report</p>
                                </div>
                            </button>
                            <button className={styles.actionCard}>
                                <div className={styles.actionIcon}><Share2 size={20} /></div>
                                <div className={styles.actionText}>
                                    <h4>Share</h4>
                                    <p>Send to patient</p>
                                </div>
                            </button>
                            <button className={styles.actionCard}>
                                <div className={styles.actionIcon}><Printer size={20} /></div>
                                <div className={styles.actionText}>
                                    <h4>Print</h4>
                                    <p>Physical copy</p>
                                </div>
                            </button>
                            <button className={styles.actionCard}>
                                <div className={styles.actionIcon}><FileText size={20} /></div>
                                <div className={styles.actionText}>
                                    <h4>View Full</h4>
                                    <p>Complete report</p>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* Audit Trail */}
                <div className={styles.auditTrail}>
                    <div className={styles.auditTitle}>
                        <History size={14} /> Activity Log
                    </div>
                    <div className={styles.auditLog}>
                        {auditLog.map((entry, i) => (
                            <div key={i} className={styles.logEntry}>
                                <span className={styles.logTime}>{entry.time}</span>
                                <span className={`${styles.logMessage} ${styles[entry.type]}`}>
                                    {entry.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalizeReport;
