import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "./slice/notificationSlice";

export const store = configureStore({
  reducer: {
    notification: notificationReducer,
  },
});