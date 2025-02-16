import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setIsButtonDisabled(
      !(username.trim() && email.trim() && password.trim() && password2.trim() && validateEmail(email))
    );
  }, [username, email, password, password2]);

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailPattern.test(email);
  };

  const handleRegister = () => {
    if (!validateEmail(email)) {
      setErrorMessage("Érvénytelen email cím!");
      return;
    }
    if (password !== password2) {
      setErrorMessage("A két jelszó nem egyezik!");
      return;
    }
    
    setErrorMessage("");
    localStorage.setItem("user", username);
    localStorage.setItem("email", email);
    navigate("/dashboard");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleRegister();
  };

  return (
    <div className="login-background">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
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
          <p className="login-footer">Már van fiókod? <a href="/" className="login-link">Bejelentkezés</a></p>
        </div>
      </div>
    </div>
  );
}
