import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt, FaCartPlus, FaUserAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";

export default function Dashboard() {
  const username = localStorage.getItem("user") || "Felhasználó";
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | number>("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    if (!userId) {
      setErrorMessage("Felhasználói azonosító nem található.");
      return;
    }

    // Dashboard adatlekérés
    axios
      .get(`http://localhost:3000/dashboard/${userId}`)
      .then((response) => {
        setDashboardData(response.data);
        setEvents(response.data.events || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Hiba a dashboard adatok lekérésekor:", error);
        setErrorMessage("Nem sikerült betölteni a dashboard adatokat.");
        setLoading(false);
      });

    // User szerepkör lekérése
    axios
      .get(`http://localhost:3000/currentUser/${userId}`)
      .then((response) => {
        const role = response.data?.role;
        setUserRole(role);
      })
      .catch((error) => {
        console.error("Nem sikerült lekérni a felhasználó szerepkörét:", error);
      });
  }, [userId]);

  const statCard = (title: string, value: number, color: string, onClick: () => void) => (
    <div className="col-md-3">
      <div
        className="card p-3 shadow-sm stat-card"
        style={{ backgroundColor: color, color: "white", cursor: "pointer" }}
        onClick={onClick}
      >
        <h5 className="text-center">{title}</h5>
        <h1 className="text-center">{value}</h1>
      </div>
    </div>
  );

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center navbar-container">
        <button className="btn btn-dark mb-3 nav-btn active-nav-icon" onClick={() => navigate("/dashboard")}>
          <RiDashboard3Fill size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/esemenyek")}>
          <FaCalendarAlt size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/foglalas")}>
          <FaCartPlus size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/profil")}>
          <FaUserAlt size={24} className="nav-icon" />
        </button>
        {(userRole === 1 || userRole === "Admin") && (
          <div className="mt-auto mb-3">
            <button className="btn btn-dark nav-btn" onClick={() => navigate("/beallitasok")}> 
              <FaPencil size={24} className="nav-icon" />
            </button>
          </div>
        )}
        <button onClick={handleLogout} className="btn nav-btn logout-btn mb-2">
          <IoIosLogOut size={24} className="nav-icon logout-icon" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ marginLeft: "5%" }}>
        <h2>Üdv, {username}!</h2>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        {loading && <p>Betöltés...</p>}

        {!loading && dashboardData && (
          <>
            <div className="row">
              {statCard("Eddigi foglalásaid", dashboardData.totalBookings, "rgb(50, 180, 220)", () => navigate("/foglalasok"))}
              {statCard("Hány eseményen vettél részt", dashboardData.participatedEvents, "rgb(220, 70, 130)", () => navigate("/esemenyek"))}
              {statCard("Aktív bérlések", dashboardData.activeRentals, "rgb(240, 120, 60)", () => navigate("/berlesek"))}
              {statCard("Aktív események", events.length, "rgb(90, 30, 100)", () => navigate("/esemenyek"))}
            </div>

            <div className="row mt-4">
              <div className="col-md-6">
                <div className="card p-3 shadow-sm d-flex flex-column custom-scroll" style={{ height: "calc(100vh - 250px)", cursor: "pointer" }} onClick={() => navigate("/berlesek")}>
                  <h5 className="p-2 border-bottom">Aktív bérlések</h5>
                  <div className="table-responsive flex-grow-1 overflow-auto">
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
                        {(dashboardData.rentals || []).map((rental: any, index: number) => (
                          <tr key={index}>
                            <td>{rental.id}</td>
                            <td>{rental.productName}</td>
                            <td>{rental.startDate}</td>
                            <td>{rental.endDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card p-3 shadow-sm d-flex flex-column custom-scroll" style={{ height: "calc(100vh - 250px)", cursor: "pointer" }} onClick={() => navigate("/esemenyek")}> 
                  <h5 className="p-2 border-bottom">Aktív események</h5>
                  <div className="table-responsive flex-grow-1 overflow-auto">
                    <table className="table table-striped">
                      <thead className="sticky-top bg-white">
                        <tr>
                          <th>ID</th>
                          <th>Esemény</th>
                          <th>Dátum</th>
                          <th>Bérlés</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event: any, index: number) => (
                          <tr key={index}>
                            <td>{event.id}</td>
                            <td>{event.name}</td>
                            <td>{event.date}</td>
                            <td>
                              <span className={`chip ${event.hasRental ? "chip-green" : "chip-blue"}`}>
                                {event.hasRental ? "Kértél eszközt" : "Saját eszközt hozol"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
