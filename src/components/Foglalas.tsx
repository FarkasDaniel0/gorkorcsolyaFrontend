import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt, FaCartPlus, FaUserAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { Modal, Button, Form } from "react-bootstrap";

const BASE_API_URL = "http://localhost:3000";

export default function Foglalas() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userId, setUserId] = useState<string | null>(localStorage.getItem("userId"));
  const [userRole, setUserRole] = useState<string | number>("");
  const [events, setEvents] = useState<any[]>([]);
  const [skates, setSkates] = useState<any[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [feetSize, setFeetSize] = useState("");
  const [skateId, setSkateId] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");

  const handleLogout = useCallback(() => {
    localStorage.clear();
    setUserId(null);
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use((config) => {
      if (token) {
        const isEventsGet = config.method?.toLowerCase() === "get" && config.url?.includes("/events");
        if (!isEventsGet) {
          config.headers?.set('Authorization', `Bearer ${token}`);
        }
      }
      return config;
    });

    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [token, handleLogout]);

  useEffect(() => {
    if (!userId) navigate("/");
  }, [userId, navigate]);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      const [eventsRes, userRes, skatesRes] = await Promise.all([
        axios.get(`${BASE_API_URL}/events/?id=${userId}`),
        axios.get(`${BASE_API_URL}/currentUser/${userId}`),
        axios.get(`${BASE_API_URL}/availableSkates`),
      ]);

      setEvents(eventsRes.data);
      setUserRole(userRes.data?.role);
      setSkates(skatesRes.data);
    } catch {
      /* swallow */
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, location]);

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  const handleBooking = async () => {
    if (!userId || !selectedEvent) return;
    try {
      const finalFeetSize = feetSize ? parseInt(feetSize) : 0;
      const finalSkateId = feetSize ? skateId : 1;

      await axios.post(`${BASE_API_URL}/rents`, {
        UserId: parseInt(userId),
        EventId: selectedEvent.id,
        FeetSize: finalFeetSize,
        SkateId: finalSkateId,
      });

      setShowBookingModal(false);
      setFeetSize("");
      setSkateId(0);
      setSelectedEvent(null);
      setSuccessMessage("Sikeres foglalás!");

      // Újra lekérjük a friss adatokat
      fetchData();
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.message || error.response?.data || "Hiba történt a foglalás során. Próbáld újra.";
      setErrorMessage(backendMessage);
    }
  };

  const handleSkateChange = (id: number) => {
    setSkateId(id);
    const skate = skates.find((s) => s.id === id);
    if (skate && skate.size) setFeetSize(String(skate.size));
  };

  const formatGender = (g: number) => (g === 1 ? "Nő" : g === 2 ? "Férfi" : "Egyéb");

  const filteredSkates = feetSize ? skates.filter((s) => String(s.size) === feetSize) : skates;

  return (
    <div className="d-flex vh-100">
      <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center justify-content-between navbar-container">
        <div className="d-flex flex-column align-items-center">
          <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/dashboard")}> <RiDashboard3Fill size={24} className="nav-icon" /> </button>
          <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/esemenyek")}> <FaCalendarAlt size={24} className="nav-icon" /> </button>
          <button className="btn btn-dark mb-3 nav-btn active-nav-icon" onClick={() => navigate("/berlesek")}> <FaCartPlus size={24} className="nav-icon" /> </button>
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

      <div className="flex-grow-1 p-4" style={{ marginLeft: "5%", overflowY: "auto" }}>
        <h2>Elérhető események</h2>

        {successMessage && <div className="login-alert success-alert">{successMessage}</div>}

        <div className="row">
          {events.map((event) => (
            <div key={event.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{event.name}</h5>
                  <p><strong>Kezdés:</strong> {new Date(event.startDate).toLocaleString()}</p>
                  <p><strong>Befejezés:</strong> {new Date(event.endDate).toLocaleString()}</p>
                  <p><strong>Szabad helyek:</strong> {event.availablePLaces}</p>
                  <p><strong>Foglalt helyek:</strong> {event.reserved}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowBookingModal(true);
                      setErrorMessage("");
                    }}
                  >
                    Részletek / Foglalás
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Foglalás modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Foglalás</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <div className="login-alert error-alert">{errorMessage}</div>}
          {selectedEvent && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Esemény neve</Form.Label>
                <Form.Control type="text" value={selectedEvent.name} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Lábméret</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="pl. 38"
                  value={feetSize}
                  min={38}
                  max={45}
                  onChange={(e) => setFeetSize(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Korcsolya kiválasztása</Form.Label>
                <Form.Select
                  value={skateId}
                  onChange={(e) => handleSkateChange(Number(e.target.value))}
                >
                  <option value={0}>Válassz korcsolyát...</option>
                  {filteredSkates.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.id} - Méret: {s.size}, Típus: {s.type}, Nem: {formatGender(s.gender)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookingModal(false)}>Mégse</Button>
          <Button variant="primary" onClick={handleBooking}>Foglalás</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
