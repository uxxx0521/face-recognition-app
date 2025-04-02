import React from "react";
import styles from "./Instructions.module.css";

const Instructions: React.FC = () => {
    return (
        <section className={styles.instructions}>
            <h2>👋 Welcome to Voicera Face Detection</h2>
            <p>
                Click the <strong>Start</strong> button to begin real-time facial detection using your webcam.
                You’ll see age, gender, and emotion insights appear right on the video.
            </p>
            <p>
                When you're done, hit <strong>Stop</strong> to end the detection session.
            </p>
            <p>
                Prefer not to use your webcam? No problem — you can also <strong>upload an image</strong> and
                we’ll analyze that too.
            </p>
            <p>
                Have fun exploring how our AI understands expressions in real-time! 😄
            </p>
        </section>
    );
};

export default Instructions;
