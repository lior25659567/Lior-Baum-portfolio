import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp, STATUS, STATUS_CONFIG } from '../context/AppContext';
import styles from './StatusBadge.module.css';

const STATUS_ICONS = {
    [STATUS.DRAFT]: FileText,
    [STATUS.IN_REVIEW]: Clock,
    [STATUS.APPROVED]: CheckCircle,
    [STATUS.REVISED]: AlertCircle
};

const StatusBadge = ({ editable = false }) => {
    const { reportStatus, setReportStatus } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const config = STATUS_CONFIG[reportStatus];
    const Icon = STATUS_ICONS[reportStatus];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusChange = (status) => {
        setReportStatus(status);
        setIsOpen(false);
    };

    if (!editable) {
        return (
            <div
                className={styles.badge}
                style={{ backgroundColor: config.bg, color: config.color }}
            >
                <Icon size={14} />
                <span>{config.label}</span>
            </div>
        );
    }

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.badgeButton}
                style={{ backgroundColor: config.bg, color: config.color }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Icon size={14} />
                <span>{config.label}</span>
                <ChevronDown size={12} className={isOpen ? styles.chevronOpen : ''} />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>Change Status (Demo)</div>
                    {Object.values(STATUS).map((status) => {
                        const statusConfig = STATUS_CONFIG[status];
                        const StatusIcon = STATUS_ICONS[status];
                        const isActive = reportStatus === status;
                        return (
                            <button
                                key={status}
                                className={`${styles.option} ${isActive ? styles.active : ''}`}
                                onClick={() => handleStatusChange(status)}
                            >
                                <StatusIcon size={14} style={{ color: statusConfig.color }} />
                                <span>{statusConfig.label}</span>
                                {isActive && <Check size={14} className={styles.checkIcon} />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StatusBadge;
