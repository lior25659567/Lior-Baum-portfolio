import React, { useState } from 'react';
import {
    Layers, SplitSquareHorizontal, ZoomIn, ZoomOut,
    Maximize, RotateCcw, Move, Eye, EyeOff, Upload
} from 'lucide-react';
import { useApp, ROLES, STATUS } from '../context/AppContext';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LockedOverlay from '../components/LockedOverlay';
import styles from './VisualEvidence.module.css';

const TEETH_UPPER = ['18', '17', '16', '15', '14', '13', '12', '11'];
const TEETH_LOWER = ['48', '47', '46', '45', '44', '43', '42', '41'];

const VisualEvidence = () => {
    const { currentRole, reportStatus, hasPermission, isLocked } = useApp();
    const [showAnnotations, setShowAnnotations] = useState(true);
    const [comparisonMode, setComparisonMode] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [activeView, setActiveView] = useState('occlusal');
    const [hoveredTooth, setHoveredTooth] = useState(null);
    const [hasImages, setHasImages] = useState(true); // Toggle for demo

    const canEditAnnotations = hasPermission('canEditAnnotations');

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));

    // Empty state for missing images
    if (!hasImages) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyContainer}>
                    <EmptyState
                        type="noImage"
                        title="No Scan Images Uploaded"
                        description="Upload intraoral scan images to begin AI analysis and annotation."
                        actionLabel={currentRole === ROLES.LAB ? "Upload Images" : undefined}
                        onAction={currentRole === ROLES.LAB ? () => setHasImages(true) : undefined}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.toolGroup}>
                    <div className={styles.viewSelector}>
                        <button
                            className={`${styles.viewBtn} ${activeView === 'occlusal' ? styles.active : ''}`}
                            onClick={() => setActiveView('occlusal')}
                        >
                            Occlusal
                        </button>
                        <button
                            className={`${styles.viewBtn} ${activeView === 'buccal' ? styles.active : ''}`}
                            onClick={() => setActiveView('buccal')}
                        >
                            Buccal
                        </button>
                        <button
                            className={`${styles.viewBtn} ${activeView === 'lingual' ? styles.active : ''}`}
                            onClick={() => setActiveView('lingual')}
                        >
                            Lingual
                        </button>
                    </div>

                    <div className={styles.divider} />

                    <Button
                        variant={comparisonMode ? 'primary' : 'secondary'}
                        size="sm"
                        icon={<SplitSquareHorizontal size={16} />}
                        onClick={() => setComparisonMode(!comparisonMode)}
                    >
                        Compare
                    </Button>

                    <Button
                        variant={showAnnotations ? 'primary' : 'secondary'}
                        size="sm"
                        icon={showAnnotations ? <Eye size={16} /> : <EyeOff size={16} />}
                        onClick={() => setShowAnnotations(!showAnnotations)}
                    >
                        Annotations
                    </Button>

                    {/* Demo toggle for empty state */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHasImages(false)}
                        style={{ marginLeft: 'auto', opacity: 0.5, fontSize: '11px' }}
                    >
                        (Demo: Show Empty)
                    </Button>
                </div>

                <div className={styles.toolGroup}>
                    <Button variant="ghost" size="sm" icon={<RotateCcw size={16} />} />
                    <Button variant="ghost" size="sm" icon={<Move size={16} />} />
                    <div className={styles.divider} />
                    <Button variant="ghost" size="sm" icon={<ZoomOut size={16} />} onClick={handleZoomOut} />
                    <input
                        type="range"
                        className={styles.zoomSlider}
                        min="50"
                        max="200"
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(Number(e.target.value))}
                    />
                    <Button variant="ghost" size="sm" icon={<ZoomIn size={16} />} onClick={handleZoomIn} />
                    <div className={styles.divider} />
                    <Button variant="ghost" size="sm" icon={<Maximize size={16} />} />
                </div>
            </div>

            <div className={styles.viewerContainer}>
                {/* Main View */}
                <div className={styles.viewer}>
                    {/* Locked overlay for non-editors */}
                    {!canEditAnnotations && !isLocked() && (
                        <div className={styles.viewOnlyBadge}>View Only</div>
                    )}

                    <div className={styles.viewerHeader}>
                        <div>
                            <span className={styles.viewerTitle}>Current Scan: Upper Arch</span>
                            <span className={styles.viewerTimestamp}>Oct 24, 2024 • High Resolution</span>
                        </div>
                        <span className={styles.viewerBadge}>{activeView.charAt(0).toUpperCase() + activeView.slice(1)} View</span>
                    </div>

                    <div className={styles.canvas}>
                        {/* Simulated Teeth Grid */}
                        <div className={styles.teethGrid} style={{ transform: `scale(${zoomLevel / 100})`, transition: 'transform 0.3s' }}>
                            {TEETH_UPPER.map((tooth) => (
                                <div
                                    key={tooth}
                                    className={`${styles.tooth} ${tooth === '14' ? styles.highlighted : ''}`}
                                    onMouseEnter={() => setHoveredTooth(tooth)}
                                    onMouseLeave={() => setHoveredTooth(null)}
                                >
                                    {tooth}
                                </div>
                            ))}
                            {TEETH_LOWER.map((tooth) => (
                                <div
                                    key={tooth}
                                    className={styles.tooth}
                                    onMouseEnter={() => setHoveredTooth(tooth)}
                                    onMouseLeave={() => setHoveredTooth(null)}
                                >
                                    {tooth}
                                </div>
                            ))}
                        </div>

                        {showAnnotations && (
                            <div className={styles.annotationsLayer}>
                                <div className={`${styles.annotation} ${styles.aiFinding}`} style={{ top: '28%', left: '42%' }}>
                                    1
                                    <div className={styles.annotationTooltip}>Interproximal Caries</div>
                                </div>
                                <div className={`${styles.annotation} ${styles.aiFinding}`} style={{ top: '42%', left: '62%' }}>
                                    2
                                    <div className={styles.annotationTooltip}>Marginal Discrepancy</div>
                                </div>
                                <div className={`${styles.annotation} ${styles.clinicianNote}`} style={{ top: '65%', left: '38%' }}>
                                    N
                                    <div className={styles.annotationTooltip}>Clinician Note</div>
                                </div>
                            </div>
                        )}

                        {/* Legend */}
                        {showAnnotations && (
                            <div className={styles.legendPanel}>
                                <div className={styles.legendTitle}>Annotations</div>
                                <div className={styles.legendItem}>
                                    <div className={`${styles.legendDot} ${styles.ai}`} />
                                    AI Findings (2)
                                </div>
                                <div className={styles.legendItem}>
                                    <div className={`${styles.legendDot} ${styles.clinician}`} />
                                    Notes (1)
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.infoOverlay}>
                        <div className={styles.infoItem}>
                            <Move size={14} /> Drag to pan
                        </div>
                        <div className={styles.infoItem}>
                            {hoveredTooth ? `Tooth #${hoveredTooth}` : 'Hover over tooth for details'}
                        </div>
                        <div className={styles.infoItem}>
                            Zoom: {zoomLevel}%
                        </div>
                    </div>
                </div>

                {/* Comparison View (Conditional) */}
                {comparisonMode && (
                    <div className={styles.viewer} style={{ opacity: 0.9 }}>
                        <div className={styles.viewerHeader}>
                            <div>
                                <span className={styles.viewerTitle}>Historical Scan: Upper Arch</span>
                                <span className={styles.viewerTimestamp}>Jan 12, 2024 • Baseline</span>
                            </div>
                            <span className={styles.viewerBadge}>Historical</span>
                        </div>
                        <div className={styles.canvas}>
                            <div className={styles.teethGrid} style={{ transform: `scale(${zoomLevel / 100})`, opacity: 0.6 }}>
                                {TEETH_UPPER.map((tooth) => (
                                    <div key={tooth} className={styles.tooth}>{tooth}</div>
                                ))}
                                {TEETH_LOWER.map((tooth) => (
                                    <div key={tooth} className={styles.tooth}>{tooth}</div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.infoOverlay}>
                            <div className={styles.infoItem}>9 months ago</div>
                            <div className={styles.infoItem}>No annotations</div>
                            <div className={styles.infoItem}>Zoom: {zoomLevel}%</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualEvidence;
