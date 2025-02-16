// Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";


export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const navigate = useNavigate();
  
    useEffect(() => {
        setIsButtonDisabled(!(username.trim() && password.trim()));
      }, [username, password]);
    
      const handleLogin = () => {
        if (username.trim() && password.trim()) {
          localStorage.setItem("user", username);
          navigate("/dashboard");
        }
      };
  
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleLogin();
    };

  
      return (
        <div className="login-background">
          <div className="login-container">
            <div className="login-card">
              <h2 className="login-title">Üdv újra!</h2>
              <p className="login-subtitle">Kérlek, add meg az adataidat a bejelentkezéshez!</p>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Felhasználónév vagy Jelszó"
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
              <p className="login-footer">Még nincs felhasználód? <a href="/SignUp" className="login-link">Regisztrálok</a></p>
            </div>
          </div>
        </div>
      );
  }
  