import React from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import styles from './SystemWarning.module.css';

const ICONS = {
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info
};

const SystemWarning = ({ type = 'warning', message, dismissible = true, onDismiss }) => {
    const Icon = ICONS[type];

    return (
        <div className={`${styles.warning} ${styles[type]}`}>
            <Icon size={16} className={styles.icon} />
            <span className={styles.message}>{message}</span>
            {dismissible && onDismiss && (
                <button className={styles.dismiss} onClick={onDismiss}>
                    <X size={14} />
                </button>
            )}
        </div>
    );
};

export default SystemWarning;
