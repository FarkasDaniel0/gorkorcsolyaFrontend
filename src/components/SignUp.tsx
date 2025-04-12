import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setIsButtonDisabled(
      !(username.trim() && email.trim() && password.trim() && password2.trim() && validateEmail(email))
    );
  }, [username, email, password, password2]);

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailPattern.test(email);
  };

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      setErrorMessage("Érvénytelen email cím!");
      return;
    }
    if (password !== password2) {
      setErrorMessage("A két jelszó nem egyezik!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/auth/register", {
        registerRequest: {
          email: email,
          password: password
        },
        name: username,
        role: 0
      });

      const userId = response.data?.id || response.data?.user?.id;
      if (userId) {
        localStorage.setItem("userId", userId);
      }

      localStorage.setItem("user", username);
      setErrorMessage("");
      setSuccessMessage("Sikeres regisztráció!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error: any) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Sikertelen regisztráció. Próbáld újra.";
      setErrorMessage(backendMessage);
      setSuccessMessage("");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleRegister();
  };

  return (
    <div className="login-background">
      {errorMessage && (
        <div className="login-alert error-alert">{errorMessage}</div>
      )}
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Üdv!</h2>
          <p className="login-subtitle">Kérlek, add meg az adataidat a regisztrációhoz.</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Felhasználónév"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
            <input
              type="text"
              placeholder="Email cím"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`login-input ${!validateEmail(email) && email ? "input-error-border" : ""}`}
            />
            <input
              type="password"
              placeholder="Jelszó"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`login-input ${errorMessage.includes("jelszó") ? "input-error" : ""}`}
            />
            <input
              type="password"
              placeholder="Jelszó ismét"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className={`login-input ${errorMessage.includes("jelszó") ? "input-error" : ""}`}
            />
            <button
              type="submit"
              className={`login-button ${isButtonDisabled ? "disabled" : ""}`}
              disabled={isButtonDisabled}
            >
              Regisztráció
            </button>
          </form>
          <p className="login-footer">
            Már van fiókod? <a href="/" className="login-link">Bejelentkezés</a>
          </p>
        </div>
      </div>
      {successMessage && (
        <div className="login-alert success-alert">{successMessage}</div>
      )}
    </div>
  );
}
