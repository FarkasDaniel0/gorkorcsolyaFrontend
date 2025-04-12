import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt, FaCartPlus, FaUserAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";

const BASE_API_URL = "http://localhost:3000";
const IMAGE_FOLDER = "/Kepek";
const IMAGE_COUNT = 6;

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("userId"));
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | number>("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    if (!userId) {
      navigate("/");
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    setUserId(null);
    navigate("/");
  };

  const fetchDashboardData = async () => {
    if (!userId) {
      setErrorMessage("Felhasználói azonosító nem található.");
      return;
    }
    setLoading(true);
    try {
      const dashboardRes = await axios.get(`${BASE_API_URL}/dashboard/${userId}`);
      setDashboardData(dashboardRes.data);
    } catch (error) {
      console.error("Hiba a dashboard adatok lekérésekor:", error);
      setErrorMessage("Nem sikerült betölteni a dashboard adatokat.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    if (!userId) return;
    try {
      const userRes = await axios.get(`${BASE_API_URL}/currentUser/${userId}`);
      const role = userRes.data?.role;
      setUserRole(role);
    } catch (error) {
      console.error("Nem sikerült lekérni a felhasználó szerepkörét:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUserRole();
  }, [location]);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextImage();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevImage = () => {
    setDirection("left");
    setCurrentImageIndex((prev) => (prev - 1 + IMAGE_COUNT) % IMAGE_COUNT);
  };

  const handleNextImage = () => {
    setDirection("right");
    setCurrentImageIndex((prev) => (prev + 1) % IMAGE_COUNT);
  };

  const statCard = (title: string, value: number, color: string, onClick: () => void) => (
    <div className="col-6 mb-3">
      <div
        className="card p-3 shadow-sm stat-card rounded"
        style={{ backgroundColor: color, color: "white", cursor: "pointer" }}
        onClick={onClick}
      >
        <h5 className="text-center mb-0">{title}</h5>
        <h1 className="text-center">{value}</h1>
      </div>
    </div>
  );

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Sidebar */}
      <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center justify-content-between navbar-container">
        <div className="d-flex flex-column align-items-center">
          <button className="btn btn-dark mb-3 nav-btn active-nav-icon" onClick={() => navigate("/dashboard")}> <RiDashboard3Fill size={24} className="nav-icon" /> </button>
          <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/esemenyek")}> <FaCalendarAlt size={24} className="nav-icon" /> </button>
          <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/foglalas")}> <FaCartPlus size={24} className="nav-icon" /> </button>
          <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/profil")}> <FaUserAlt size={24} className="nav-icon" /> </button>
        </div>
        <div className="d-flex flex-column align-items-center">
          <div style={{ height: "40px", marginBottom: "12px" }}>
            {userRole === 0 ? (
              <button className="btn btn-dark nav-btn" onClick={() => navigate("/beallitasok")}> <FaPencil size={24} className="nav-icon" /> </button>
            ) : (
              <div style={{ width: "40px" }}></div>
            )}
          </div>
          <button onClick={handleLogout} className="btn nav-btn logout-btn mb-2"> <IoIosLogOut size={24} className="nav-icon logout-icon" /> </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1" style={{ marginLeft: "5%", paddingBottom: "20px" }}>
        {/* Felső rész - köszöntés */}
        <div className="bg-light px-4 py-3 border-bottom w-100">
          <h2 className="mb-0">Üdv, {dashboardData?.felhasznalo || "Felhasználó"}!</h2>
        </div>

        <div className="row g-0 w-100 flex-grow-1">
          {/* Bal oldal */}
          <div className="col-lg-6 d-flex flex-column justify-content-start p-4" style={{ maxHeight: "calc(100vh - 120px)" }}>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {loading && <p>Betöltés...</p>}

            {!loading && dashboardData && (
              <>
                <div className="row mb-3">
                  {statCard("Eddigi foglalásaid", dashboardData.osszesites.eddigiFoglalasok, "rgb(50, 180, 220)", () => {})}
                  {statCard("Aktív bérlések", dashboardData.osszesites.aktivBerlesekSzama, "rgb(240, 120, 60)", () => {})}
                </div>

                <div className="card p-3 shadow-sm d-flex flex-column custom-scroll flex-grow-1" style={{ cursor: "pointer", overflow: "auto" }} onClick={() => navigate("/esemenyek")}> 
                  <h5 className="p-2 border-bottom">Aktív bérlések</h5>
                  <div className="table-responsive flex-grow-1">
                    <table className="table table-striped">
                      <thead className="sticky-top bg-white">
                        <tr>
                          <th>ID</th>
                          <th>Termék</th>
                          <th>Kezdés</th>
                          <th>Lejárat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboardData.aktivBerlesek || []).map((rental: any, index: number) => (
                          <tr key={index}>
                            <td>{rental.id}</td>
                            <td>{rental.termek}</td>
                            <td>{rental.kezdes}</td>
                            <td>{rental.lejarat}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Jobb oldal - képnézegető */}
          <div className="col-lg-6 d-flex flex-column justify-content-start p-4">
            <div className="card shadow-sm d-flex flex-column align-items-center justify-content-between rounded overflow-hidden h-100 bg-light">
              <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
                <img
                  key={currentImageIndex}
                  src={`${IMAGE_FOLDER}/KorcsolyaKep${currentImageIndex + 1}.png`}
                  alt={`Kép ${currentImageIndex + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                    animation: `${direction === "right" ? "slideInFromRight" : "slideInFromLeft"} 0.5s ease`
                  }}
                />
                <div style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  animation: `${direction === "right" ? "slideInFromRight" : "slideInFromLeft"} 0.5s ease`
                }}>
                  A kép ChatGPT 4o modell által lett generálva, kizálólag bemutatási céllal.
                </div>
              </div>
              <div className="p-3 d-flex gap-2 bg-white w-100 justify-content-center">
                <button className="btn btn-outline-secondary" onClick={handlePrevImage}>Előző</button>
                <button className="btn btn-outline-secondary" onClick={handleNextImage}>Következő</button>
              </div>
            </div>
          </div>
        </div>

        <style>
          {`
            @keyframes slideInFromRight {
              0% { transform: translateX(100%); opacity: 0; }
              100% { transform: translateX(0); opacity: 1; }
            }

            @keyframes slideInFromLeft {
              0% { transform: translateX(-100%); opacity: 0; }
              100% { transform: translateX(0); opacity: 1; }
            }
          `}
        </style>
      </div>
    </div>
  );
}
