import React from 'react';
import { Lock } from 'lucide-react';
import styles from './LockedOverlay.module.css';

const LockedOverlay = ({ message = 'This section is locked', reason }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.content}>
                <div className={styles.icon}>
                    <Lock size={20} />
                </div>
                <span className={styles.message}>{message}</span>
                {reason && <span className={styles.reason}>{reason}</span>}
            </div>
        </div>
    );
};

export default LockedOverlay;
