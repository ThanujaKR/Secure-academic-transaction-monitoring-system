import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setUserToken } from "../redux/actions";

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

const useInactivityLogout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const timerRef = useRef(null);

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userType");
    dispatch(setUserToken(null));
    toast.error("Session expired due to inactivity. Please log in again.");
    navigate("/login");
  };

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    resetTimer();
    EVENTS.forEach((e) => window.addEventListener(e, resetTimer));

    return () => {
      clearTimeout(timerRef.current);
      EVENTS.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);
};

export default useInactivityLogout;
