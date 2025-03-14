import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import "bootstrap/dist/css/bootstrap.min.css";


export default function Dashboard() {
  const username = localStorage.getItem("user") || "Felhasználó";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const data = [
    { id: 1, esemény: "Görkori verseny", dátum: "2024-04-01", berles: true },
    { id: 2, esemény: "Éjszakai túra", dátum: "2024-05-10", berles: false },
    { id: 3, esemény: "Hétvégi verseny", dátum: "2024-06-15", berles: true },
    { id: 4, esemény: "Közösségi görkorizás", dátum: "2024-07-05", berles: false }
  ];
  

  return (
    <div className="d-flex vh-100">
     
         {/* Responsive Navbar */}
      <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center navbar-container">
        <button className="btn btn-dark mb-3 nav-btn active-nav-icon" onClick={() => navigate("/dashboard")}>
          <RiDashboard3Fill size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn "  onClick={() => navigate("/esemenyek")}>
          <FaCalendarAlt size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/foglalas")}>
          <FaCartPlus size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/profil")}>
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
     
      
      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ marginLeft: "5%" }}>
        <h2>Üdv, {username}!</h2>
        
        {/* Statisztikai kártyák */}
        <div className="row">
          <div className="col-md-3">
            <div className="card p-3 shadow-sm stat-card" style={{ backgroundColor: "rgb(50, 180, 220)", color: "white", cursor: "pointer" }} onClick={() => navigate("/foglalasok")}> 
              <h5 className="text-center">Eddigi foglalásaid</h5>
              <h1 className="text-center">10</h1>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 shadow-sm stat-card" style={{ backgroundColor: "rgb(220, 70, 130)", color: "white", cursor: "pointer" }} onClick={() => navigate("/esemenyek")}> 
              <h5 className="text-center">Hány eseményen vettél részt</h5>
              <h1 className="text-center">5</h1>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 shadow-sm stat-card" style={{ backgroundColor: "rgb(240, 120, 60)", color: "white", cursor: "pointer" }} onClick={() => navigate("/berlesek")}> 
              <h5 className="text-center">Aktív bérlések</h5>
              <h1 className="text-center">2</h1>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 shadow-sm stat-card" style={{ backgroundColor: "rgb(90, 30, 100)", color: "white", cursor: "pointer" }} onClick={() => navigate("/esemenyek")}> 
              <h5 className="text-center">Aktív események</h5>
              <h1 className="text-center">3</h1>
            </div>
          </div>
        </div>
        
        {/* Aktív bérlések és események táblázatok */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card p-3 shadow-sm d-flex flex-column custom-scroll" style={{ height: "calc(100vh - 250px)", cursor: "pointer" }} onClick={() => navigate("/berlesek")}> 
              <h5 className="p-2 border-bottom">Aktív bérlések</h5>
              <div className="table-responsive flex-grow-1 overflow-auto">
                <table className="table table-striped">
                  <thead className="sticky-top bg-white">
                    <tr>
                      <th>ID</th>
                      <th>Termék</th>
                      <th>Kezdés</th>
                      <th>Lejárat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(30)].map((_, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>Görkorcsolya</td>
                        <td>2024-03-{String(index + 1).padStart(2, '0')}</td>
                        <td>2024-03-{String(index + 10).padStart(2, '0')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>


          
          <div className="col-md-6">
  <div
    className="card p-3 shadow-sm d-flex flex-column custom-scroll"
    style={{ height: "calc(100vh - 250px)", cursor: "pointer" }}
    onClick={() => navigate("/esemenyek")}
  >
    <h5 className="p-2 border-bottom">Aktív események</h5>
    <div className="table-responsive flex-grow-1 overflow-auto">
      <table className="table table-striped">
        <thead className="sticky-top bg-white">
          <tr>
            <th>ID</th>
            <th>Esemény</th>
            <th>Dátum</th>
            <th>Bérlés</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.id}</td>
              <td>{row.esemény}</td>
              <td>{row.dátum}</td>
              <td>
                <span className={`chip ${row.berles ? "chip-green" : "chip-blue"}`}>
                  {row.berles ? "Kértél eszközt" : "Saját eszközt hozol"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>


        </div>
      </div>
    </div>
  );
}
