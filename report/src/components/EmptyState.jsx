import React from 'react';
import { FileQuestion, ImageOff, AlertCircle, Search } from 'lucide-react';
import Button from './Button';
import styles from './EmptyState.module.css';

const ICONS = {
    noData: FileQuestion,
    noImage: ImageOff,
    error: AlertCircle,
    noResults: Search
};

const EmptyState = ({
    type = 'noData',
    title = 'No data available',
    description,
    actionLabel,
    onAction
}) => {
    const Icon = ICONS[type];

    return (
        <div className={styles.container}>
            <div className={styles.icon}>
                <Icon size={32} />
            </div>
            <h3 className={styles.title}>{title}</h3>
            {description && <p className={styles.description}>{description}</p>}
            {actionLabel && onAction && (
                <Button variant="primary" size="sm" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
