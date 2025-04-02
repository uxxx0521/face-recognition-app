import React, { useRef, useState } from "react";
import * as faceapi from "face-api.js";
import styles from "./UploadFile.module.css";
import heic2any from "heic2any";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import {
    updateResults,
    setNoFaceDetected,
} from "../../state/detection/detectionSlice";

const UploadFile: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dispatch = useAppDispatch();
    const noFaceDetected = useAppSelector((state) => state.detection.noFaceDetected);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        dispatch(setNoFaceDetected(false)); // Reset message

        let finalFile: File = file;

        if (file.name.endsWith(".heic") || file.type === "image/heic") {
            try {
                const result = await heic2any({ blob: file, toType: "image/jpeg" });
                finalFile = new File([result as Blob], file.name.replace(/\.heic$/i, ".jpg"), {
                    type: "image/jpeg",
                    lastModified: file.lastModified,
                });
            } catch (error) {
                console.error("❌ Failed to convert HEIC:", error);
                return;
            }
        }

        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(finalFile);
    };

    const handleDetect = async () => {
        if (!imageRef.current || !canvasRef.current) return;

        await faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector");
        await faceapi.nets.ageGenderNet.loadFromUri("/models/age_gender_model");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models/face_expression");

        const detections = await faceapi
            .detectAllFaces(imageRef.current, new faceapi.TinyFaceDetectorOptions())
            .withAgeAndGender()
            .withFaceExpressions();

        if (!detections || detections.length === 0) {
            dispatch(setNoFaceDetected(true));
            return;
        }

        dispatch(setNoFaceDetected(false));

        const canvas = canvasRef.current;
        const displaySize = {
            width: imageRef.current.width,
            height: imageRef.current.height,
        };
        faceapi.matchDimensions(canvas, displaySize);
        const resized = faceapi.resizeResults(detections, displaySize);

        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resized);

        resized.forEach((result) => {
            const { age, gender, expressions, detection } = result;
            const box = detection.box;
            const emotion = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0][0];
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.font = "16px Arial";
                ctx.fillText(`${gender}, ${Math.round(age)}, ${emotion}`, box.x, box.y - 10);
            }
        });

        const resultData = resized.map((r) => ({
            age: Math.round(r.age),
            gender: r.gender,
            emotion: Object.entries(r.expressions).sort((a, b) => b[1] - a[1])[0][0],
        }));
        dispatch(updateResults(resultData));
    };

    return (
        <div className={styles.wrapper}>
            <input type="file" accept="image/*" onChange={handleImageUpload} className={styles.fileInput} />
            {imageSrc && (
                <div className={styles.imageContainer}>
                    <img
                        ref={imageRef}
                        src={imageSrc}
                        alt="Uploaded"
                        className={styles.image}
                        onLoad={() => {
                            if (canvasRef.current && imageRef.current) {
                                canvasRef.current.width = imageRef.current.width;
                                canvasRef.current.height = imageRef.current.height;
                            }
                        }}
                    />
                    <canvas ref={canvasRef} className={styles.canvas} />
                </div>
            )}
            {imageSrc && (
                <button onClick={handleDetect} className={styles.detectButton}>
                    Detect Faces
                </button>
            )}
            {noFaceDetected && (
                <p className={styles.noFaceMessage}>No face detected in the image.</p>
            )}
        </div>
    );
};

export default UploadFile;