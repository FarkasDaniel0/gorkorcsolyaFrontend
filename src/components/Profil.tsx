import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt, FaCartPlus, FaUserAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { Form, Button } from "react-bootstrap";
import axios from "axios";

const BASE_API_URL = "http://localhost:3000";

export default function Profil() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(localStorage.getItem("userId"));
  const [email, setEmail]           = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword]     = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userRole, setUserRole] = useState<string | number>("");

  const token = localStorage.getItem("token");

  /* ---------- interceptor + logout ---------- */
  const logout = useCallback(() => { localStorage.clear(); navigate("/"); }, [navigate]);

  useEffect(() => {
    const reqInt = axios.interceptors.request.use(cfg=>{
      if (token) cfg.headers.set("Authorization", `Bearer ${token}`);
      return cfg;
    });
    const resInt = axios.interceptors.response.use(
      r => r,
      e => { if (e.response?.status === 401) logout(); return Promise.reject(e); }
    );
    return () => {
      axios.interceptors.request.eject(reqInt);
      axios.interceptors.response.eject(resInt);
    };
  }, [token, logout]);

  /* ---------- adatbetöltés ---------- */
  useEffect(() => {
    if (!userId) { navigate("/"); return; }
    axios.get(`${BASE_API_URL}/currentUser/${userId}`)
      .then(res=>{
        setEmail(res.data?.email || "");
        setDisplayName(res.data?.name || "");
        setUserRole(res.data?.role);
      })
      .catch(()=>{});
  }, [userId, navigate]);

  /* ---------- mentés ---------- */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !passwordConfirm) { setErrorMessage("Kérlek töltsd ki mindkét jelszómezőt!"); return; }
    if (password !== passwordConfirm)   { setErrorMessage("A két jelszó nem egyezik!"); return; }

    setErrorMessage(""); setSuccessMessage("");

    try {
      await axios.put(
        `${BASE_API_URL}/users`,    // /${userId}
        { name: displayName, newPassword: password },           //  ← kért body
      );
      setSuccessMessage("Profil sikeresen frissítve.");
      setPassword(""); setPasswordConfirm("");
    } catch {
      setErrorMessage("A frissítés nem sikerült.");
    }
  };

  const formIncomplete = !email || !displayName || !password || !passwordConfirm;

  /* ---------- JSX ---------- */
  return (
    <div className="d-flex vh-100">
      {/* -------------------------- Sidebar ---------------------- */}
            <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center justify-content-between navbar-container">
              <div className="d-flex flex-column align-items-center">
                <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/dashboard")}> <RiDashboard3Fill size={24} className="nav-icon" /> </button>
                <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/esemenyek")}> <FaCalendarAlt size={24} className="nav-icon" /> </button>
                <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/foglalas")}> <FaCartPlus size={24} className="nav-icon" /> </button>
                <button className="btn btn-dark mb-3 nav-btn active-nav-icon" onClick={() => navigate("/profil")}> <FaUserAlt size={24} className="nav-icon" /> </button>
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

      {/* ----- Main ----- */}
      <div className="flex-grow-1 p-4" style={{ marginLeft:"5%", overflowY:"auto" }}>
        <h2>Profil</h2>

        {errorMessage   && <div className="alert alert-danger">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <Form onSubmit={handleSaveProfile}>
          <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={email} disabled /></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Display Name</Form.Label>
            <Form.Control type="text" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3"><Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Új jelszó" value={password} onChange={e=>setPassword(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3"><Form.Label>Password again</Form.Label>
            <Form.Control type="password" placeholder="Új jelszó újra" value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={formIncomplete}>Mentés</Button>
        </Form>
      </div>
    </div>
  );
}
