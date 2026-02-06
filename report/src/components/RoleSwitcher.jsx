import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Stethoscope, FlaskConical, Check } from 'lucide-react';
import { useApp, ROLES, ROLE_LABELS } from '../context/AppContext';
import styles from './RoleSwitcher.module.css';

const ROLE_ICONS = {
    [ROLES.DOCTOR]: Stethoscope,
    [ROLES.ASSISTANT]: User,
    [ROLES.LAB]: FlaskConical
};

const RoleSwitcher = () => {
    const { currentRole, setCurrentRole } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const CurrentIcon = ROLE_ICONS[currentRole];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRoleChange = (role) => {
        setCurrentRole(role);
        setIsOpen(false);
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
            >
                <CurrentIcon size={16} />
                <span>{ROLE_LABELS[currentRole]}</span>
                <ChevronDown size={14} className={isOpen ? styles.chevronOpen : ''} />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>Switch Role (Demo)</div>
                    {Object.values(ROLES).map((role) => {
                        const Icon = ROLE_ICONS[role];
                        const isActive = currentRole === role;
                        return (
                            <button
                                key={role}
                                className={`${styles.option} ${isActive ? styles.active : ''}`}
                                onClick={() => handleRoleChange(role)}
                            >
                                <Icon size={16} />
                                <span>{ROLE_LABELS[role]}</span>
                                {isActive && <Check size={14} className={styles.checkIcon} />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RoleSwitcher;
