import { useState } from 'react';
import { useApp, ROLES, STATUS } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import {
    FileCheck, Calendar, User, Building2,
    ZoomIn, ZoomOut, Move, Layers, Eye,
    ChevronDown, ChevronUp, AlertTriangle, Info
} from 'lucide-react';
import styles from './ReviewEvidence.module.css';

const ReviewEvidence = () => {
    const { currentRole, reportStatus, hasPermission, isLocked } = useApp();
    const [showPatientInfo, setShowPatientInfo] = useState(true);
    const [hasImages, setHasImages] = useState(true);
    const [activeView, setActiveView] = useState('cbct');
    const [selectedTooth, setSelectedTooth] = useState(null);

    const canEditAnnotations = hasPermission('canEditAnnotations') && !isLocked();

    // Mock patient data
    const patient = {
        name: 'Sarah Johnson',
        id: 'P-2024-00847',
        dob: 'Mar 15, 1985',
        provider: 'Dr. Michael Chen'
    };

    // Mock report summary
    const summary = {
        findings: 8,
        highPriority: 2,
        confidence: 94
    };

    // Mock annotations data
    const annotations = [
        { id: 1, x: '25%', y: '35%', type: 'ai', label: 'Cavity detected', tooth: '#14' },
        { id: 2, x: '65%', y: '45%', type: 'ai', label: 'Root issue', tooth: '#19' },
        { id: 3, x: '45%', y: '60%', type: 'clinician', label: 'Monitor area', tooth: '#30' },
    ];

    // Mock teeth grid
    const upperTeeth = ['18', '17', '16', '15', '14', '13', '12', '11'].map(n => `#${n}`);
    const lowerTeeth = ['48', '47', '46', '45', '44', '43', '42', '41'].map(n => `#${n}`);
    const highlightedTeeth = ['#14', '#19', '#30'];

    if (!hasImages) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyContainer}>
                    <EmptyState
                        type="noImage"
                        title="No Scan Images"
                        description="Upload CBCT or panoramic images to begin analysis"
                        actionLabel={currentRole === ROLES.LAB ? "Upload Images" : undefined}
                        onAction={() => setHasImages(true)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Patient Info Card - Collapsible */}
            <div className={styles.patientCard}>
                <button
                    className={styles.patientToggle}
                    onClick={() => setShowPatientInfo(!showPatientInfo)}
                >
                    <div className={styles.patientHeader}>
                        <User size={16} />
                        <span className={styles.patientName}>{patient.name}</span>
                        <span className={styles.patientId}>{patient.id}</span>
                    </div>
                    <div className={styles.summaryBadges}>
                        <span className={styles.findingsBadge}>
                            {summary.findings} findings
                        </span>
                        {summary.highPriority > 0 && (
                            <span className={styles.priorityBadge}>
                                <AlertTriangle size={12} />
                                {summary.highPriority} high priority
                            </span>
                        )}
                    </div>
                    {showPatientInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showPatientInfo && (
                    <div className={styles.patientDetails}>
                        <div className={styles.detailItem}>
                            <Calendar size={14} />
                            <span>DOB: {patient.dob}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <Building2 size={14} />
                            <span>{patient.provider}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <FileCheck size={14} />
                            <span>Confidence: {summary.confidence}%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* View Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolGroup}>
                    <div className={styles.viewSelector}>
                        <button
                            className={`${styles.viewBtn} ${activeView === 'cbct' ? styles.active : ''}`}
                            onClick={() => setActiveView('cbct')}
                        >
                            CBCT
                        </button>
                        <button
                            className={`${styles.viewBtn} ${activeView === 'pano' ? styles.active : ''}`}
                            onClick={() => setActiveView('pano')}
                        >
                            Panoramic
                        </button>
                    </div>
                </div>
                <div className={styles.toolGroup}>
                    <button className={styles.toolBtn}><ZoomIn size={18} /></button>
                    <button className={styles.toolBtn}><ZoomOut size={18} /></button>
                    <button className={styles.toolBtn}><Move size={18} /></button>
                    <div className={styles.divider} />
                    <button className={styles.toolBtn}><Layers size={18} /></button>
                    <button className={styles.toolBtn}><Eye size={18} /></button>
                </div>
                {!canEditAnnotations && !isLocked() && (
                    <div className={styles.viewOnlyBadge}>
                        <Info size={12} /> View Only
                    </div>
                )}
            </div>

            {/* Main Viewer */}
            <div className={styles.viewerContainer}>
                <div className={styles.viewer}>
                    <div className={styles.viewerHeader}>
                        <div>
                            <span className={styles.viewerTitle}>
                                {activeView === 'cbct' ? 'CBCT Scan' : 'Panoramic X-Ray'}
                            </span>
                            <span className={styles.viewerTimestamp}>Captured: Jan 28, 2024</span>
                        </div>
                        <span className={styles.viewerBadge}>AI Analyzed</span>
                    </div>

                    <div className={styles.canvas}>
                        {/* Teeth Grid Visualization */}
                        <div className={styles.teethGrid}>
                            {[...upperTeeth, ...lowerTeeth].map((tooth, i) => (
                                <div
                                    key={tooth}
                                    className={`${styles.tooth} ${highlightedTeeth.includes(tooth) ? styles.highlighted : ''} ${selectedTooth === tooth ? styles.selected : ''}`}
                                    onClick={() => setSelectedTooth(tooth)}
                                >
                                    {tooth}
                                </div>
                            ))}
                        </div>

                        {/* Annotation Markers */}
                        <div className={styles.annotationsLayer}>
                            {annotations.map(ann => (
                                <div
                                    key={ann.id}
                                    className={`${styles.annotation} ${ann.type === 'ai' ? styles.aiFinding : styles.clinicianNote}`}
                                    style={{ left: ann.x, top: ann.y }}
                                    onClick={() => setSelectedTooth(ann.tooth)}
                                >
                                    {ann.id}
                                    <div className={styles.annotationTooltip}>
                                        {ann.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className={styles.legendPanel}>
                        <div className={styles.legendTitle}>Annotations</div>
                        <div className={styles.legendItem}>
                            <span className={`${styles.legendDot} ${styles.ai}`}></span>
                            AI Finding ({annotations.filter(a => a.type === 'ai').length})
                        </div>
                        <div className={styles.legendItem}>
                            <span className={`${styles.legendDot} ${styles.clinician}`}></span>
                            Clinician ({annotations.filter(a => a.type === 'clinician').length})
                        </div>
                    </div>

                    {/* Zoom Info */}
                    <div className={styles.infoOverlay}>
                        <div className={styles.infoItem}>
                            <span>Zoom: 100%</span>
                            <input type="range" className={styles.zoomSlider} defaultValue={50} />
                        </div>
                    </div>
                </div>

                {/* Selected Tooth Details */}
                {selectedTooth && (
                    <div className={styles.detailsPanel}>
                        <h3>Tooth {selectedTooth}</h3>
                        {annotations.filter(a => a.tooth === selectedTooth).map(ann => (
                            <div key={ann.id} className={styles.findingDetail}>
                                <span className={`${styles.findingType} ${ann.type === 'ai' ? styles.ai : styles.clinician}`}>
                                    {ann.type === 'ai' ? 'AI Finding' : 'Clinician Note'}
                                </span>
                                <p>{ann.label}</p>
                            </div>
                        ))}
                        {annotations.filter(a => a.tooth === selectedTooth).length === 0 && (
                            <p className={styles.noFindings}>No findings on this tooth</p>
                        )}
                    </div>
                )}
            </div>

            {/* Demo toggle */}
            <button
                className={styles.demoToggle}
                onClick={() => setHasImages(!hasImages)}
            >
                Toggle Empty State (Demo)
            </button>
        </div>
    );
};

export default ReviewEvidence;
