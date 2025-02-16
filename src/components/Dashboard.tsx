// Dashboard.tsx
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";



export default function Dashboard() {
  const username = localStorage.getItem("user");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (

    <div className="d-flex vh-100">
      {/* Sticked Navbar */}
      <div className="d-flex flex-column bg-dark text-white p-3 position-fixed top-0 start-0 h-100" style={{ width: "250px" }}>
        <h2 className="mb-4">Dashboard</h2>
        <button className="btn btn-outline-light mb-2">Button 1</button>
        <button className="btn btn-outline-light mb-2">Button 2</button>
        <button className="btn btn-outline-light mb-2">Button 3</button>
        <button className="btn btn-outline-light mb-2">Button 4</button>
        <button className="btn btn-outline-light mb-2">Button 5</button>
        <div className="mt-auto">
          <button onClick={handleLogout} className="btn btn-danger w-100">Logout</button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center text-dark" style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}>
        
        <h2>Welcome, {username}!</h2>
        
      </div>
    </div>
  );
}
