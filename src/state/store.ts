import { configureStore } from "@reduxjs/toolkit";
import detectionReducer from "./detection/detectionSlice";

export const store = configureStore({
  reducer: {
    detection: detectionReducer,
  },
});

// Type helpers for useDispatch and useSelector
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
  