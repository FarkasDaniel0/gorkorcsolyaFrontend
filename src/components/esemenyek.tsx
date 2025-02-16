import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { FaPencilAlt, FaTrash, FaPlus } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";

interface Event {
  id: number;
  esemény: string;
  dátum: string;
  berles?: boolean;
  berlesMennyiseg?: number;
}

const meghirdetettEsemenyek: Event[] = [
    { id: 1, esemény: "Görkori verseny", dátum: "2024-04-01"},
    { id: 2, esemény: "Éjszakai túra", dátum: "2024-05-10"},
    { id: 3, esemény: "Hétvégi verseny", dátum: "2024-06-15"},
    { id: 4, esemény: "Közösségi görkorizás", dátum: "2024-07-05" }]

export default function Dashboard() {
  const username = localStorage.getItem("user") || "Felhasználó";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };
  const [data, setData] = useState<Event[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEventId, setNewEventId] = useState<number>(0);
  const [berlesMennyiseg, setBerlesMennyiseg] = useState<number>(0);

  const handleEdit = (event: Event) => {
    setSelectedEvent({ ...event });
    setShowEditModal(true);
  };


  const handleDelete = (event: Event) => {
    setSelectedEvent({ ...event });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedEvent) {
      setData(data.filter((item) => item.id !== selectedEvent.id));
      setShowDeleteModal(false);
      setSelectedEvent(null);
    }
  };

  const handleSaveEdit = () => {
    if (selectedEvent) {
      setData(data.map(item => item.id === selectedEvent.id ? { ...item, berlesMennyiseg: selectedEvent.berlesMennyiseg } : item));
      setShowEditModal(false);
    }
  };

  const handleAddEvent = () => {
    setShowAddModal(true);
  };

  const saveNewEvent = () => {
    if (newEventId > 0) {
      const selected = meghirdetettEsemenyek.find(e => e.id === newEventId);
      if (selected) {
        setData([...data, { ...selected, berles: berlesMennyiseg > 0, berlesMennyiseg }]);
      }
    }
    setShowAddModal(false);
    setNewEventId(0);
    setBerlesMennyiseg(0);
  };

  return (
    <div className="d-flex vh-100">
     
         {/* Responsive Navbar */}
      <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center navbar-container">
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/dashboard")}>
          <RiDashboard3Fill size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn active-nav-icon"  onClick={() => navigate("/esemenyek")}>
          <FaCalendarAlt size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/berlesek")}>
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
      <div className="flex-grow-1 p-4 position-relative" style={{ marginLeft: "5%" }}>
      <h2>Események</h2>

      {/* Új esemény hozzáadása gomb */}
      <button 
        className="btn btn-primary rounded-circle position-absolute top-0 end-0 m-3"
        style={{ width: "50px", height: "50px" }}
        onClick={handleAddEvent}
      >
        <FaPlus />
      </button>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead className="sticky-top bg-white">
            <tr>
              <th>ID</th>
              <th>Esemény</th>
              <th>Dátum</th>
              <th>Bérlés</th>
              <th>Műveletek</th>
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
                    {row.berles ? `Kért ${row.berlesMennyiseg} eszközt` : "Saját eszközt hoz"}
                  </span>
                </td>
                <td>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(row)}>
                    <FaPencilAlt />
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Új esemény modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Új esemény hozzáadása</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Válassz eseményt</Form.Label>
              <Form.Select value={newEventId} onChange={(e) => setNewEventId(Number(e.target.value))}>
                <option value={0}>Válassz egy eseményt...</option>
                {meghirdetettEsemenyek.map(e => (
                  <option key={e.id} value={e.id}>{e.esemény} - {e.dátum}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kért görkorcsolyák száma</Form.Label>
              <Form.Control type="number" value={berlesMennyiseg} onChange={(e) => setBerlesMennyiseg(Number(e.target.value))} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Mégse</Button>
          <Button variant="primary" onClick={saveNewEvent}>Hozzáadás</Button>
        </Modal.Footer>
      </Modal>

      {/* Szerkesztés modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bérlés módosítása</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Esemény neve</Form.Label>
                <Form.Control type="text" value={selectedEvent.esemény} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Dátum</Form.Label>
                <Form.Control type="text" value={selectedEvent.dátum} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Kért görkorcsolyák száma</Form.Label>
                <Form.Control type="number" value={selectedEvent.berlesMennyiseg || 0} onChange={(e) => setSelectedEvent({...selectedEvent, berlesMennyiseg: Number(e.target.value)})} />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Mégse</Button>
          <Button variant="primary" onClick={handleSaveEdit}>Mentés</Button>
        </Modal.Footer>
      </Modal>

      {/* Törlés modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Törlés megerősítése</Modal.Title>
        </Modal.Header>
        <Modal.Body>Biztosan törölni szeretnéd az eseményt?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Mégse</Button>
          <Button variant="danger" onClick={confirmDelete}>Törlés</Button>
        </Modal.Footer>
      </Modal>
    </div>
      
      
      
      </div>
  );
}
