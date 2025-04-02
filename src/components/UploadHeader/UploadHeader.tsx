import React from "react";
import styles from "./UploadHeader.module.css";

const UploadHeader: React.FC = () => {
    return (
        <div className={styles.header}>
            <hr className={styles.divider} />
            <h2>Upload a photo here!</h2>
            <p>
                Select an image and click <strong>Detect Faces</strong> to see age, gender, and emotion
                analysis. HEIC (iPhone) files are supported!
            </p>
        </div>
    );
};

export default UploadHeader;