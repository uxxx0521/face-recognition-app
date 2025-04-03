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
                <button className={styles.badgeButton}>Demo</button>
            </div>
        </header>
    );
};

export default Header;

