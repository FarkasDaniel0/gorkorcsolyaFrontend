import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_API_URL = "http://localhost:3000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setIsButtonDisabled(!(email.trim() && password.trim()));
  }, [email, password]);

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BASE_API_URL}/api/auth/login`, {
        email,
        password,
      });

      const userId = response.data?.userId;
      if (!userId) {
        throw new Error("A válasz nem tartalmaz userId-t.");
      }

      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("user", email);
      setErrorMessage("");
      setSuccessMessage("Sikeres bejelentkezés!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Sikertelen bejelentkezés. Próbáld újra.";
      setErrorMessage(backendMessage);
      setSuccessMessage("");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleLogin();
  };

  return (
    <div className="login-background">
      {errorMessage && (
        <div className="login-alert error-alert">{errorMessage}</div>
      )}
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Üdv újra!</h2>
          <p className="login-subtitle">
            Kérlek, add meg az adataidat a bejelentkezéshez!
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Email cím"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Jelszó"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button
              type="submit"
              className={`login-button ${isButtonDisabled ? "disabled" : ""}`}
              disabled={isButtonDisabled}
            >
              Bejelentkezés
            </button>
          </form>
          <p className="login-footer">
            Még nincs felhasználód?{" "}
            <a href="/SignUp" className="login-link">
              Regisztrálok
            </a>
          </p>
        </div>
      </div>
      {successMessage && (
        <div className="login-alert success-alert">{successMessage}</div>
      )}
    </div>
  );
}
