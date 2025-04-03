import React from "react";
import styles from "./Header.module.css";

const Header: React.FC = () => {
    return (
        <header className={styles.header}>
            <div className={styles.logoContainer}>
                <img
                    src={`${import.meta.env.BASE_URL}logo.png`}
                    alt="Voicera Logo"
                    className={styles.logo}
                />
                <h1 className={styles.title}>AI Facial Detection Test App</h1>
            </div>

            <div>
                <span className={styles.badge}>Live Demo</span>
            </div>
        </header>
    );
};

export default Header;

