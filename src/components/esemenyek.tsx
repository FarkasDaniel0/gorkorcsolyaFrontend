import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt, FaCartPlus, FaUserAlt } from "react-icons/fa";
import { FaPencil, FaTrash } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { Modal, Button } from "react-bootstrap";

const BASE_API_URL = "http://localhost:3000";

export default function Esemenyek() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------- State ---------- */
  const [userId] = useState<string | null>(localStorage.getItem("userId"));
  const [userRole, setUserRole] = useState<string | number>("");

  const [rents, setRents]               = useState<any[]>([]);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  /* törlés-modal vezérlés */
  const [showDeleteModal, setShowDeleteModal]         = useState(false);
  const [selectedRent, setSelectedRent]               = useState<any | null>(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState<any | null>(null);

  const token      = localStorage.getItem("token");
  const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  /* ---------- 401 interceptor + logout ---------- */
  const logout = useCallback(() => { localStorage.clear(); navigate("/"); }, [navigate]);
  useEffect(() => {
    const intc = axios.interceptors.response.use(
      (r) => r,
      (e) => { if (e.response?.status === 401) logout(); return Promise.reject(e); }
    );
    return () => axios.interceptors.response.eject(intc);
  }, [logout]);

  /* ---------- Fetch dashboard ----------- */
  useEffect(() => {
    if (!userId) { navigate("/"); return; }

    axios.get(`${BASE_API_URL}/dashboard/${userId}`, authHeader)
      .then(res => {
        setRents(res.data?.aktivBerlesek ?? []);
        setActiveEvents(res.data?.aktivEsemenyek ?? []);
      })
      .catch(() => setErrorMessage("Nem sikerült betölteni a dashboard-adatokat."));

    axios.get(`${BASE_API_URL}/currentUser/${userId}`, authHeader)
      .then(res => setUserRole(res.data?.role))
      .catch(() => {});
  }, [userId, location]);

  /* ---------- Bérlések rendezése ---------- */
  const [sortCfg, setSortCfg] = useState<{key:string;direction:"asc"|"desc"|"default"}>({key:"",direction:"default"});
  const handleSort = (k:string) => setSortCfg((s)=>s.key!==k?{key:k,direction:"asc"}:
    {key:k,direction:s.direction==="asc"?"desc":s.direction==="desc"?"default":"asc"});

  const sortedRents = useMemo(() => {
    const arr=[...rents];
    if (sortCfg.key && sortCfg.direction!=="default") {
      arr.sort((a,b)=>{
        const av=a[sortCfg.key], bv=b[sortCfg.key];
        return typeof av==="string"?av.localeCompare(bv):av-bv;
      });
      if (sortCfg.direction==="desc") arr.reverse();
    }
    return arr;
  },[rents,sortCfg]);

  /* ---------- Delete helpers ---------- */
  const openDeleteForRent = async (rent:any) => {
    setSelectedRent(rent);
    try {
      const ev = await axios.get(`${BASE_API_URL}/events/${rent.EventId ?? rent.id}`, authHeader);
      setSelectedEventDetails(ev.data);
    } catch { setSelectedEventDetails(null); }
    setShowDeleteModal(true);
  };

  /* aktív eseménynél → keressük hozzá a felhasználó bérlését */
  const openDeleteForActiveEvent = async (ev:any) => {
    try {
      const { data } = await axios.get(`${BASE_API_URL}/rents`, authHeader);
      const rent = data.find((r:any)=>r.EventId===ev.id && r.UserId===Number(userId));
      if (!rent) { setErrorMessage("Ehhez az eseményhez nincs bérlésed."); return; }
      await openDeleteForRent(rent);
    } catch { setErrorMessage("Nem sikerült lekérni a bérlés adatát."); }
  };

  const confirmDelete = async () => {
    if (!selectedRent) return;
    try {
      await axios.delete(`${BASE_API_URL}/rents/${selectedRent.id}`, authHeader);
      /* front-oldali lista frissítés */
      setRents(rents.filter(r=>r.id!==selectedRent.id));
      setActiveEvents(activeEvents.filter(e=>e.id!==selectedRent.EventId));
    } catch { setErrorMessage("Törlés sikertelen."); }
    setShowDeleteModal(false);
    setSelectedRent(null);
    setSelectedEventDetails(null);
  };

  /* ---------------- JSX ---------------- */
  return (
    <div className="d-flex vh-100">

      {/* -------------------------- Sidebar ---------------------- */}
      <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center justify-content-between navbar-container">
        <div className="d-flex flex-column align-items-center">
          <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/dashboard")}> <RiDashboard3Fill size={24} className="nav-icon" /> </button>
          <button className="btn btn-dark mb-3 nav-btn active-nav-icon" onClick={() => navigate("/esemenyek")}> <FaCalendarAlt size={24} className="nav-icon" /> </button>
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
          <button onClick={logout} className="btn nav-btn logout-btn mb-2"> <IoIosLogOut size={24} className="nav-icon logout-icon" /> </button>
        </div>
      </div>

      {/* ---------- Main ---------- */}
      <div className="flex-grow-1 p-4" style={{ marginLeft:"5%" }}>

        {/* Aktív bérlések ------------------------------------------------ */}
        <h3>Aktív bérléseid</h3>
        <div className="table-responsive mb-4" style={{ maxHeight:"40vh", overflowY:"auto" }}>
          <table className="table table-striped">
            <thead className="sticky-top bg-white">
              <tr>
                <th onClick={()=>handleSort("id")}     style={{cursor:"pointer"}}>ID</th>
                <th onClick={()=>handleSort("termek")} style={{cursor:"pointer"}}>Termék</th>
                <th>Kezdés</th><th>Lejárat</th><th>Művelet</th>
              </tr>
            </thead>
            <tbody>
              {sortedRents.length ? sortedRents.map(r=>(
                <tr key={r.id}>
                  <td>{r.id}</td><td>{r.termek}</td>
                  <td>{new Date(r.kezdes).toLocaleDateString()}</td>
                  <td>{new Date(r.lejarat).toLocaleDateString()}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={()=>openDeleteForRent(r)}><FaTrash /></button></td>
                </tr>
              )):<tr><td colSpan={5} className="text-center">Nincs aktív bérlés</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Aktív események ---------------------------------------------- */}
        <h3>Aktív eseményeid</h3>
        <div className="table-responsive" style={{ maxHeight:"40vh", overflowY:"auto" }}>
          <table className="table table-striped">
            <thead className="sticky-top bg-white">
              <tr><th>ID</th><th>Esemény</th><th>Dátum</th><th>Bérlés info</th><th>Művelet</th></tr>
            </thead>
            <tbody>
              {activeEvents.length ? activeEvents.map(ev=>(
                <tr key={ev.id}>
                  <td>{ev.id}</td><td>{ev.esemeny}</td>
                  <td>{new Date(ev.datum).toLocaleDateString()}</td>
                  <td>{ev.berles}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={()=>openDeleteForActiveEvent(ev)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              )):<tr><td colSpan={5} className="text-center">Nincs aktív esemény</td></tr>}
            </tbody>
          </table>
        </div>

        {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}

        {/* ---------- Confirm modal ---------- */}
        <Modal show={showDeleteModal} onHide={()=>setShowDeleteModal(false)}>
          <Modal.Header closeButton><Modal.Title>Foglalás lemondása</Modal.Title></Modal.Header>
          <Modal.Body>
            <p>Biztosan le szeretnéd mondani ezt a foglalást?</p>
            {selectedRent && (
              <>
                <p><strong>Termék:</strong> {selectedRent.termek}</p>
                <p><strong>Kezdés:</strong> {new Date(selectedRent.kezdes).toLocaleDateString()}</p>
                <p><strong>Lejárat:</strong> {new Date(selectedRent.lejarat).toLocaleDateString()}</p>
              </>
            )}
            {selectedEventDetails && (
              <div className="mt-3">
                <p><strong>Esemény neve:</strong> {selectedEventDetails.name}</p>
                <p><strong>Esemény kezdete:</strong> {new Date(selectedEventDetails.startDate).toLocaleString()}</p>
                <p><strong>Esemény vége:</strong>   {new Date(selectedEventDetails.endDate).toLocaleString()}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={()=>setShowDeleteModal(false)}>Mégse</Button>
            <Button variant="danger"    onClick={confirmDelete}>Lemondás</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
