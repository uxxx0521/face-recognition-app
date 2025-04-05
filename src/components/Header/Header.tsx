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
                <h1 className={styles.title}>AI Face Recognition Test App</h1>
            </div>

            <div>
                <a href="https://youtu.be/XXoTvwu1RBY"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}>
                    <button className={styles.badgeButton}>Demo</button>
                </a>
            </div>
        </header>
    );
};

export default Header;

