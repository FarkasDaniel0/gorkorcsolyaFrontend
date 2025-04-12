import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";

const BASE_API_URL = "http://localhost:3000";

export default function Profil() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("userId"));
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
   const [userRole, setUserRole] = useState<string | number>("");

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    axios.get(`${BASE_API_URL}/currentUser/${userId}`)
      .then(res => {
        setEmail(res.data?.email || "");
        setDisplayName(res.data?.name || "");
      })
      .catch(err => console.error("Nem sikerült lekérni a felhasználó adatokat:", err));
  }, [userId]);

  axios.get(`${BASE_API_URL}/currentUser/${userId}`)
        .then((res) => setUserRole(res.data?.role))
        .catch((err) => console.error("Nem sikerült lekérni a felhasználó szerepkörét:", err));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !passwordConfirm) {
      setErrorMessage("Kérlek töltsd ki mindkét jelszó mezőt!");
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage("A két jelszó nem egyezik!");
      return;
    }
    setErrorMessage("");
    console.log("Mentett adatok:", { email, displayName, password });
  };

  const isFormIncomplete = !email || !displayName || !password || !passwordConfirm;

  return (
    <div className="d-flex vh-100">
      <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center justify-content-between navbar-container">
        <div className="d-flex flex-column align-items-center">
          <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/dashboard")}> <RiDashboard3Fill size={24} className="nav-icon" /> </button>
          <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/esemenyek")}> <FaCalendarAlt size={24} className="nav-icon" /> </button>
          <button className="btn btn-dark mb-3 nav-btn " onClick={() => navigate("/foglalas")}> <FaCartPlus size={24} className="nav-icon" /> </button>
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
          <button onClick={handleLogout} className="btn nav-btn logout-btn mb-2"> <IoIosLogOut size={24} className="nav-icon logout-icon" /> </button>
        </div>
      </div>

      <div className="flex-grow-1 p-4" style={{ marginLeft: "5%", height: "100vh", overflowY: "auto" }}>
        <h2>Profil</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <Form onSubmit={handleSaveProfile}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} disabled />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formDisplayName">
            <Form.Label>Display Name</Form.Label>
            <Form.Control type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Írd be a jelszót" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPasswordConfirm">
            <Form.Label>Password Again</Form.Label>
            <Form.Control type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Írd be újra a jelszót" />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={isFormIncomplete}>Mentés</Button>
        </Form>
      </div>
    </div>
  );
}
