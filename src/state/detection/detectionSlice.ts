import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DetectionResult {
  age: number;
  gender: string;
  emotion: string;
}

interface DetectionState {
  isRunning: boolean;
  results: DetectionResult[];
  noFaceDetected: boolean;
}

const initialState: DetectionState = {
  isRunning: false,
  results: [],
  noFaceDetected: false,
};

const detectionSlice = createSlice({
  name: "detection",
  initialState,
  reducers: {
    startDetection(state) {
      state.isRunning = true;
      state.noFaceDetected = false;
    },
    stopDetection(state) {
      state.isRunning = false;
      state.results = [];
    },
    updateResults(state, action: PayloadAction<DetectionResult[]>) {
      state.results = action.payload;
      state.noFaceDetected = false;
    },
    setNoFaceDetected(state, action: PayloadAction<boolean>) {
      state.noFaceDetected = action.payload;
    },
  },
});

export const {
  startDetection,
  stopDetection,
  updateResults,
  setNoFaceDetected,
} = detectionSlice.actions;

export default detectionSlice.reducer;
