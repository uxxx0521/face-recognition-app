import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { startDetection, stopDetection, updateResults } from "../../state/detection/detectionSlice";
import styles from "./FaceDetectionFeed.module.css";

const WebcamWithDetection: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dispatch = useAppDispatch();
  const isRunning = useAppSelector((state) => state.detection.isRunning);

  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);


  // Load models once
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = `${import.meta.env.BASE_URL}models`;

      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(`${MODEL_URL}/tiny_face_detector`),
          faceapi.nets.ageGenderNet.loadFromUri(`${MODEL_URL}/age_gender_model`),
          faceapi.nets.faceExpressionNet.loadFromUri(`${MODEL_URL}/face_expression`),
        ]);
        console.log("✅ Models successfully loaded!");
      } catch (err) {
        console.error("❌ Error loading models:", err);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    const tryStartDetection = async () => {
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;

      if (!isRunning || !video || !canvas) return;

      await new Promise((resolve) => {
        const checkReady = () => {
          if (video.readyState === 4 || (video.videoWidth > 0 && video.videoHeight > 0)) {
            resolve(true);
          } else {
            requestAnimationFrame(checkReady);
          }
        };
        checkReady();
      });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      runDetectionLoop(); // now safely runs
    };

    tryStartDetection();
  }, [isRunning]);

  // Detection loop logic
  const runDetectionLoop = async () => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 512,
      scoreThreshold: 0.4,
    });

    const detect = async () => {
      if (!isRunningRef.current || !video || !canvas) return;

      if (video.readyState !== 4) {
        requestAnimationFrame(detect);
        return;
      }
      const detections = await faceapi
        .detectAllFaces(video, options)
        .withAgeAndGender()
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, {
        width: video.videoWidth,
        height: video.videoHeight,
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);

      const resultData = resizedDetections.map((result) => {
        const { age, gender, expressions } = result;
        const topEmotion = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0][0];
        return { age: Math.round(age), gender, emotion: topEmotion };
      });

      console.log("Result Data: ", resultData);
      dispatch(updateResults(resultData)); // ✅ dispatch to Redux

      resultData.forEach((r, i) => {
        const box = resizedDetections[i].detection.box;
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText(`${r.gender}, ${r.age}, ${r.emotion}`, box.x, box.y - 10);
      });

      // ✅ Only schedule the next frame AFTER you're done with detection
      if (isRunningRef.current) {
        requestAnimationFrame(detect);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    detect();
  };

  // Start detection
  const handleStart = () => {
    dispatch(startDetection()); // this causes <Webcam /> to render
  };

  const handleStop = () => {
    dispatch(stopDetection());

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    console.log("⛔️ Detection stopped & canvas cleared");
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={
          isRunning ? styles.videoContainer : styles.videoContainerInactive
        }
      >
        {isRunning ? (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className={styles.webcam}
              videoConstraints={{ facingMode: "user" }}
            />
            <canvas
              ref={canvasRef}
              className={styles.canvas}
            />
          </>
        ) : (
          <div className={styles.placeholder}>
            Webcam will appear here when started
          </div>
        )}
      </div>

      {!isRunning ? (
        <button onClick={handleStart} className={styles.controlButton}>
          Start
        </button>
      ) : (
        <button onClick={handleStop} className={styles.controlButton}>
          Stop
        </button>
      )}
    </div>
  );
};

export default WebcamWithDetection;
