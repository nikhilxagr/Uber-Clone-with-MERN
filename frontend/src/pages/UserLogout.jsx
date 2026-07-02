import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const UserLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .finally(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  return <div>Logging out...</div>;
};

export default UserLogout;
