
import React from "react";
import { FiLogOut } from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "./CustomButton";
import { useTheme } from "../Theme";

const Navbar = () => {
  const router = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const logouthandler = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userType");
    navigate("/");
  };

  return (
    <div
      className="shadow-md px-6 py-4 mb-6"
      style={{
        backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
        color: isDark ? "#ffffff" : "#000000",
      }}
    >
      <div className="max-w-7xl flex justify-between items-center mx-auto">

        {/* LEFT SIDE */}
        <p
          className="font-semibold text-2xl flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <RxDashboard className="mr-2" />
          {router.state && router.state.type} Dashboard
        </p>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          <CustomButton onClick={toggleTheme}>
            {isDark ? "☀️" : "🌙"}
          </CustomButton>

          <CustomButton variant="danger" onClick={logouthandler}>
            Logout <FiLogOut className="ml-2" />
          </CustomButton>
        </div>

      </div>
    </div>
  );
};

export default Navbar;