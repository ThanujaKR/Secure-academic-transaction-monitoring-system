import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserToken } from "../redux/actions";
import toast from "react-hot-toast";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    const userType = searchParams.get("userType");
    const error = searchParams.get("error");

    if (error) {
      toast.error(decodeURIComponent(error));
      navigate("/login");
      return;
    }

    if (token && userType) {
      localStorage.setItem("userToken", token);
      localStorage.setItem("userType", userType.charAt(0).toUpperCase() + userType.slice(1));
      dispatch(setUserToken(token));
      navigate(`/${userType}`);
    } else {
      navigate("/login");
    }
  }, []);

  return null;
};

export default AuthCallback;
