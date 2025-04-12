import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setIsButtonDisabled(!(username.trim() && password.trim()));
  }, [username, password]);

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email: username,
        password: password
      });

      const userId = response.data?.id || response.data?.user?.id;
      if (userId) {
        localStorage.setItem("userId", userId);
      }

      localStorage.setItem("user", username);
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
          <p className="login-subtitle">Kérlek, add meg az adataidat a bejelentkezéshez!</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Email cím"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            <a href="/SignUp" className="login-link">Regisztrálok</a>
          </p>
        </div>
      </div>
      {successMessage && (
        <div className="login-alert success-alert">{successMessage}</div>
      )}
    </div>
  );
}
