import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminProtectWrapper = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin-login");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BASE_URL}/admin/profile`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Admin authorization verification failed:", err.message);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin-login");
      });
  }, [navigate, adminToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-3">
        <i className="ri-shield-keyhole-line text-4xl text-emerald-400 animate-pulse"></i>
        <p className="text-sm font-semibold text-neutral-400 tracking-wide">
          Verifying Admin Access...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectWrapper;
