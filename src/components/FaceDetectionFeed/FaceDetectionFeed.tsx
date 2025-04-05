import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { startDetection, stopDetection, updateResults } from "../../state/detection/detectionSlice";
import styles from "./FaceDetectionFeed.module.css";

const WebcamDetectionFeed: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const dispatch = useAppDispatch();
  const isRunning = useAppSelector((state) => state.detection.isRunning);
  const isRunningRef = useRef(isRunning);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Load models
  useEffect(() => {                                                // Load model and dummy descriptor
    const loadModels = async () => {
      const MODEL_URL = `${import.meta.env.BASE_URL}models`;
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(`${MODEL_URL}/tiny_face_detector`),
          faceapi.nets.ageGenderNet.loadFromUri(`${MODEL_URL}/age_gender_model`),
          faceapi.nets.faceExpressionNet.loadFromUri(`${MODEL_URL}/face_expression`),
          faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_URL}/face_landmark_68`),
          faceapi.nets.faceRecognitionNet.loadFromUri(`${MODEL_URL}/face_recognition`),
        ]);
        console.log("Models successfully loaded!");

        const dummyDescriptor = new Float32Array(128).fill(0);     // Dummy descriptor, unlikely to match any real face
        const dummyLabel = "unknown";
        const labeledDescriptors = [new faceapi.LabeledFaceDescriptors(dummyLabel, [dummyDescriptor])];
        faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      } catch (err) {
        console.error("Error loading models: ", err);
      }
    };
    loadModels();
  }, []);

  // Check if video is ready
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

      runDetectionLoop();       // now safely runs
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
      if (                                                        // Check everything before start detection
        !isRunningRef.current ||
        !video ||
        !canvas ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return;
      }

      if (video.readyState !== 4) {                                // When detection just start, have some possiblity that detection doesn't run
        requestAnimationFrame(detect);
        return;
      }

      const detections = await faceapi
        .detectAllFaces(video, options)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
        .withFaceDescriptors();

      if (
        !isRunningRef.current ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return;
      }

      const resizedDetections = faceapi.resizeResults(detections, {
        width: video.videoWidth,
        height: video.videoHeight,
      });

      console.log("Result Data: ", resizedDetections);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);      // Draw boxs on faces as overlay

      const resultData = resizedDetections.map((result) => {
        const { age, gender, expressions, descriptor } = result;
        const topEmotion = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0][0];
        const match = faceMatcherRef.current?.findBestMatch(descriptor);
        const name = match?.label ?? "unknown";

        return { name, age: Math.round(age), gender, emotion: topEmotion };
      });

      dispatch(updateResults(resultData));
      console.log("Result Data: ", resultData);

      resultData.forEach((r, i) => {                              // Attach informations on the box.
        const box = resizedDetections[i].detection.box;
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText(`${r.name}, ${r.gender}, ${r.age}, ${r.emotion}`, box.x + 40, box.y - 7);
      });

      if (isRunningRef.current) {                                 // Run detection for next frame
        requestAnimationFrame(detect);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    detect();
  };

  const handleStart = () => {                                     // Start button
    dispatch(startDetection());
    console.log("Start Detection.");
  };

  const handleStop = () => {                                      // Stop button
    dispatch(stopDetection());

    const canvas = canvasRef.current;                             // Clear the canvas
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const videoEl = webcamRef.current?.video;                     // Stop the webcam stream
    const stream = videoEl?.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      console.log("Webcam stream tracks stopped.");
    }
    if (videoEl) {                                                // Release the video element’s stream reference
      videoEl.srcObject = null;
      console.log("Video element srcObject cleared.");
    }
    console.log("Detection stopped.");
  };

  return (
    <div className={styles.wrapper}>
      <div className={isRunning ? styles.videoContainer : styles.videoContainerInactive}>
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

export default WebcamDetectionFeed;
