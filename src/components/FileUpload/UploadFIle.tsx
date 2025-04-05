import React, { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import styles from "./UploadFile.module.css";
import heic2any from "heic2any";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { updateResults, setNoFaceDetected, setImageSrc } from "../../state/detection/detectionSlice";

const UploadFile: React.FC = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const dispatch = useAppDispatch();
  const noFaceDetected = useAppSelector((state) => state.detection.noFaceDetected);
  const imageSrc = useAppSelector((state) => state.detection.imageSrc);

  useEffect(() => {
    const loadModels = async () => {                                     // Load model and dummy descriptor
      const MODEL_URL = `${import.meta.env.BASE_URL}models`;
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(`${MODEL_URL}/tiny_face_detector`),
          faceapi.nets.ageGenderNet.loadFromUri(`${MODEL_URL}/age_gender_model`),
          faceapi.nets.faceExpressionNet.loadFromUri(`${MODEL_URL}/face_expression`),
          faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_URL}/face_landmark_68`),
          faceapi.nets.faceRecognitionNet.loadFromUri(`${MODEL_URL}/face_recognition`),
        ]);

        const dummyDescriptor = new Float32Array(128).fill(0);
        const labeledDescriptors = [new faceapi.LabeledFaceDescriptors("unknown", [dummyDescriptor])];
        faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      } catch (error) {
        console.error("Failed to load models or descriptor:", error);
      }
    };

    loadModels();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    dispatch(setNoFaceDetected(false));

    let finalFile: File = file;

    if (file.name.endsWith(".heic") || file.type === "image/heic") {                     // Convert HEIC file
      try {
        const result = await heic2any({ blob: file, toType: "image/jpeg" });
        finalFile = new File([result as Blob], file.name.replace(/\.heic$/i, ".jpg"), {
          type: "image/jpeg",
          lastModified: file.lastModified,
        });
      } catch (error) {
        console.error("Failed to convert HEIC:", error);
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = () => dispatch(setImageSrc(reader.result as string));
    reader.readAsDataURL(finalFile);
  };

  const handleDetect = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    const detections = await faceapi
      .detectAllFaces(imageRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withAgeAndGender()
      .withFaceExpressions()
      .withFaceDescriptors();

    if (!detections || detections.length === 0) {                     // If now face found
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

    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resized);                     // Draw box

    const resultData = resized.map((result) => {
      const { age, gender, expressions, descriptor, detection } = result;
      const topEmotion = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0][0];
      const match = faceMatcherRef.current?.findBestMatch(descriptor);
      const name = match?.label ?? "unknown";

      if (ctx) {                                                       // Draw info
        const box = detection.box;
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText(`${name}, ${gender}, ${Math.round(age)}, ${topEmotion}`, box.x + 40, box.y - 7);
      }
      return {
        name,
        age: Math.round(age),
        gender,
        emotion: topEmotion,
      };
    });

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
        <p className={styles.noFaceMessage}>☹️ No face detected in the image, try another image.</p>
      )}
    </div>
  );
};

export default UploadFile;
