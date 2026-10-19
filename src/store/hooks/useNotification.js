import { useDispatch } from "react-redux";
import { showNotification, hideNotification, clearNotification } from "../slice/notificationSlice";

export default function useNotification() {
  const dispatch = useDispatch();

  return {
    show: (payload) => dispatch(showNotification(payload)),
    hide: () => dispatch(hideNotification()),
    clear: () => dispatch(clearNotification()),
    success: (message, options = {}) =>
      dispatch(showNotification({ type: "success", message, ...options })),
    error: (message, options = {}) =>
      dispatch(showNotification({ type: "error", message, ...options })),
    warning: (message, options = {}) =>
      dispatch(showNotification({ type: "warning", message, ...options })),
    info: (message, options = {}) =>
      dispatch(showNotification({ type: "info", message, ...options })),
  };
}
