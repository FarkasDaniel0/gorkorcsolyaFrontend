import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt, FaCartPlus, FaUserAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { Modal, Button, Form } from "react-bootstrap";
import { FaPlus, FaTrash } from "react-icons/fa";

const BASE_API_URL = "http://localhost:3000";

export default function Esemenyek() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | number>("");
  const [events, setEvents] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      navigate("/");
    } else {
      setUserId(storedUserId);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    setUserId(null);
    navigate("/");
  };

  useEffect(() => {
    if (!userId) return;

    axios.get(`${BASE_API_URL}/dashboard/${userId}`)
      .then((res) => {
        const aktiv = res.data?.aktivBerlesek;
        if (Array.isArray(aktiv)) {
          setEvents(aktiv);
        } else {
          setEvents([]);
        }
      })
      .catch((err) => {
        console.error("Nem sikerült betölteni a bérléseket:", err);
        setErrorMessage("Nem sikerült betölteni a bérléseket.");
      });

    axios.get(`${BASE_API_URL}/currentUser/${userId}`)
      .then((res) => setUserRole(res.data?.role))
      .catch((err) => console.error("Nem sikerült lekérni a felhasználó szerepkörét:", err));
  }, [userId, location]);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" | "default" }>({
    key: "",
    direction: "default",
  });

  const handleSort = (key: string) => {
    if (sortConfig.key !== key) {
      setSortConfig({ key, direction: "asc" });
    } else {
      if (sortConfig.direction === "asc") {
        setSortConfig({ key, direction: "desc" });
      } else if (sortConfig.direction === "desc") {
        setSortConfig({ key: "", direction: "default" });
      } else {
        setSortConfig({ key, direction: "asc" });
      }
    }
  };

  const sortedEvents = useMemo(() => {
    let sortable = [...events];
    if (sortConfig.key && sortConfig.direction !== "default") {
      sortable.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof typeof a];
        const bVal = b[sortConfig.key as keyof typeof b];
        return typeof aVal === "string" && typeof bVal === "string"
          ? aVal.localeCompare(bVal)
          : (aVal as number) - (bVal as number);
      });
      if (sortConfig.direction === "desc") sortable.reverse();
    }
    return sortable;
  }, [events, sortConfig]);

  const handleCancel = async () => {
    if (!selectedEvent) return;
    try {
      await axios.delete(`${BASE_API_URL}/rents/${selectedEvent.id}`);
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setSelectedEvent(null);
      setSelectedEventDetails(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Nem sikerült törölni a foglalást:", error);
    }
  };

  const handleOpenDeleteModal = async (event: any) => {
    setSelectedEvent(event);
    try {
      const rentsRes = await axios.get(`${BASE_API_URL}/rents`);
      const matchingRent = rentsRes.data.find((r: any) => r.id === event.id);
      if (matchingRent && matchingRent.EventId) {
        const eventRes = await axios.get(`${BASE_API_URL}/events/${matchingRent.EventId}`);
        setSelectedEventDetails(eventRes.data);
      } else {
        setSelectedEventDetails(null);
      }
    } catch (error) {
      console.error("Nem sikerült lekérni az esemény adatait:", error);
      setSelectedEventDetails(null);
    }
    setShowDeleteModal(true);
  };

  return (
    <div className="d-flex vh-100">
      <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center justify-content-between navbar-container">
        <div className="d-flex flex-column align-items-center">
          <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/dashboard")}><RiDashboard3Fill size={24} className="nav-icon" /></button>
          <button className="btn btn-dark mb-3 nav-btn active-nav-icon" onClick={() => navigate("/esemenyek")}><FaCalendarAlt size={24} className="nav-icon" /></button>
          <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/foglalas")}><FaCartPlus size={24} className="nav-icon" /></button>
          <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/profil")}><FaUserAlt size={24} className="nav-icon" /></button>
        </div>
        <div className="d-flex flex-column align-items-center">
          <div style={{ height: "40px", marginBottom: "12px" }}>
            {userRole === 0  ? (
              <button className="btn btn-dark nav-btn" onClick={() => navigate("/beallitasok")}><FaPencil size={24} className="nav-icon" /></button>
            ) : (
              <div style={{ width: "40px" }}></div>
            )}
          </div>
          <button onClick={handleLogout} className="btn nav-btn logout-btn mb-2"><IoIosLogOut size={24} className="nav-icon logout-icon" /></button>
        </div>
      </div>

      <div className="flex-grow-1 p-4 position-relative d-flex flex-column" style={{ marginLeft: "5%" }}>
        <h2>Aktív bérléseid</h2>
            
        <button
          className="btn btn-primary rounded-circle position-absolute top-0 end-0 m-3"
          style={{ width: "50px", height: "50px" }}
          onClick={() => navigate("/foglalas")}
        >
          <FaPlus />
        </button>

        <div className="table-responsive flex-grow-1" style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
          <table className="table table-striped">
            <thead className="sticky-top bg-white">
              <tr>
                <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>ID</th>
                <th onClick={() => handleSort("termek")} style={{ cursor: "pointer" }}>Termék</th>
                <th onClick={() => handleSort("kezdes")} style={{ cursor: "pointer" }}>Kezdés</th>
                <th onClick={() => handleSort("lejarat")} style={{ cursor: "pointer" }}>Lejárat</th>
                <th>Művelet</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(sortedEvents) && sortedEvents.length > 0 ? (
                sortedEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td>{event.termek}</td>
                    <td>{new Date(event.kezdes).toLocaleDateString()}</td>
                    <td>{new Date(event.lejarat).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleOpenDeleteModal(event)}
                      >
                        Lemondás
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center">Nincs megjeleníthető bérlés</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {errorMessage && <div className="login-alert error-alert mt-3">{errorMessage}</div>}

        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Új esemény hozzáadása</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Itt fog megjelenni az új esemény űrlap.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Mégse</Button>
            <Button variant="primary" onClick={() => setShowAddModal(false)}>Mentés</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Foglalás lemondása</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Biztosan le szeretnéd mondani ezt a foglalást?</p>
            {selectedEvent && (
              <div>
                <p><strong>Termék:</strong> {selectedEvent.termek}</p>
                <p><strong>Kezdés:</strong> {new Date(selectedEvent.kezdes).toLocaleDateString()}</p>
                <p><strong>Lejárat:</strong> {new Date(selectedEvent.lejarat).toLocaleDateString()}</p>
              </div>
            )}
            {selectedEventDetails && (
              <div className="mt-3">
                <p><strong>Esemény neve:</strong> {selectedEventDetails.name}</p>
                <p><strong>Esemény kezdete:</strong> {new Date(selectedEventDetails.startDate).toLocaleString()}</p>
                <p><strong>Esemény vége:</strong> {new Date(selectedEventDetails.endDate).toLocaleString()}</p>
                <p><strong>Helyek száma:</strong> {selectedEventDetails.availablePLaces}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Mégse</Button>
            <Button variant="danger" onClick={handleCancel}>Lemondás</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
