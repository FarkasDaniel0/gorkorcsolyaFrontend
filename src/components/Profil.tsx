import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

export default function Profil() {
  const navigate = useNavigate();
  const storedEmail = localStorage.getItem("userEmail") || "user@example.com";
  const storedDisplayName = localStorage.getItem("user") || "Felhasználó";

  const [email] = useState(storedEmail);
  const [displayName, setDisplayName] = useState(storedDisplayName);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // Validáció: mindkét jelszó mező kitöltése
    if (!password || !passwordConfirm) {
      setErrorMessage("Kérlek töltsd ki mindkét jelszó mezőt!");
      return;
    }
    // Validáció: a két jelszó egyezése
    if (password !== passwordConfirm) {
      setErrorMessage("A két jelszó nem egyezik!");
      return;
    }
    setErrorMessage("");
    // Mentési logika itt (pl. API hívás, localStorage frissítés)
    console.log("Mentett adatok:", { email, displayName, password });
  };

  return (
    <div className="d-flex vh-100">
      {/* Oldalsó menü (Navbar) */}
      <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center navbar-container">
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/dashboard")}>
          <RiDashboard3Fill size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/esemenyek")}>
          <FaCalendarAlt size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/foglalas")}>
          <FaCartPlus size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn active-nav-icon" onClick={() => navigate("/profil")}>
          <FaUserAlt size={24} className="nav-icon" />
        </button>
        <div className="mt-auto mb-3">
          <button className="btn btn-dark nav-btn" onClick={() => navigate("/beallitasok")}>
            <FaPencil size={24} className="nav-icon" />
          </button>
        </div>
        <button onClick={handleLogout} className="btn nav-btn logout-btn mb-2">
          <IoIosLogOut size={24} className="nav-icon logout-icon" />
        </button>
      </div>

      {/* Fő tartalom */}
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
            <Form.Control
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Írd be a jelszót"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPasswordConfirm">
            <Form.Label>Password Again</Form.Label>
            <Form.Control
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Írd be újra a jelszót"
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Mentés
          </Button>
        </Form>
      </div>
    </div>
  );
}
