import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { FaPencil, FaTrash } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { AiOutlinePlus } from "react-icons/ai";
import { useState, useEffect } from "react";
import { Button, Table, ButtonGroup, ToggleButton, Modal, Form, Alert } from "react-bootstrap";
import axios from "axios";

export default function Admin() {
  const navigate = useNavigate();

  interface Event {
    id: number;
    startDate: string;
    endDate: string;
    name: string;
    availablePLaces: number;
    accommodation: number;
    reserved: number;
  }

  interface Rental {
    id: number;
    userID: number;
    eventID: number;
    feetSize: number;
    skateID: number;
  }

  interface User {
    id: number;
    Name: string;
    Email: string;
    Role: number;
  }

  const [events, setEvents] = useState<Event[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [view, setView] = useState("events");

  const [editRental, setEditRental] = useState<Rental | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rentalToDelete, setRentalToDelete] = useState<Rental | null>(null);

  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    startDate: "",
    endDate: "",
    name: "",
    availablePlaces: 0,
    accommodation: 0,
    reserved: 0
  });

  useEffect(() => {
    axios.get("http://localhost:3000/events")
      .then(res => setEvents(res.data))
      .catch(err => console.error("Nem sikerült betölteni az eseményeket:", err));

    axios.get("http://localhost:3000/rents")
      .then(res => setRentals(res.data))
      .catch(err => console.error("Nem sikerült betölteni a bérléseket:", err));

    axios.get("http://localhost:3000/currentUser")
      .then(res => setUsers(res.data))
      .catch(err => console.error("Nem sikerült betölteni a felhasználókat:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleEditRental = (rental: Rental) => {
    axios.get(`http://localhost:3000/rents/${rental.id}`)
      .then(res => {
        setEditRental(res.data);
        setShowEditModal(true);
        setEditError("");
      })
      .catch(err => {
        setEditError("Nem sikerült betölteni a bérlés adatait.");
        console.error(err);
      });
  };

  const handleSaveRental = () => {
    if (!editRental) return;
    axios.put(`http://localhost:3000/rents/${editRental.id}`, editRental)
      .then(() => {
        setRentals(prev => prev.map(r => r.id === editRental.id ? editRental : r));
        setShowEditModal(false);
      })
      .catch(err => {
        const msg = typeof err.response?.data === 'string' ? err.response.data : "Hiba a módosítás során.";
        setEditError(msg);
      });
  };

  const handleDeleteRental = (rental: Rental) => {
    setRentalToDelete(rental);
    setShowDeleteModal(true);
  };

  const confirmDeleteRental = () => {
    if (!rentalToDelete) return;
    axios.delete(`http://localhost:3000/rents/${rentalToDelete.id}`)
      .then(() => {
        setRentals(rentals.filter(r => r.id !== rentalToDelete.id));
        setShowDeleteModal(false);
        setRentalToDelete(null);
      })
      .catch(err => {
        console.error("Törlés sikertelen:", err);
        setShowDeleteModal(false);
      });
  };

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setShowDeleteEventModal(true);
  };

  const confirmDeleteEvent = () => {
    if (!eventToDelete) return;
    axios.delete(`http://localhost:3000/events/${eventToDelete.id}`)
      .then(() => {
        setEvents(events.filter(e => e.id !== eventToDelete.id));
        setShowDeleteEventModal(false);
        setEventToDelete(null);
      })
      .catch(err => {
        console.error("Esemény törlése sikertelen:", err);
        setShowDeleteEventModal(false);
      });
  };

  const handleAddEvent = () => {
    axios.post("http://localhost:3000/events", newEvent)
      .then(res => {
        setEvents(prev => [...prev, res.data]);
        setShowAddEventModal(false);
        setNewEvent({
          startDate: "",
          endDate: "",
          name: "",
          availablePlaces: 0,
          accommodation: 0,
          reserved: 0
        });
      })
      .catch(err => {
        console.error("Nem sikerült hozzáadni az eseményt:", err);
      });
  };

  return (
    <div className="d-flex vh-100">
      <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center navbar-container">
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/dashboard")}> <RiDashboard3Fill size={24} className="nav-icon" /> </button>
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/beallitasok")}> <FaCalendarAlt size={24} className="nav-icon" /> </button>
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/foglalas")}> <FaCartPlus size={24} className="nav-icon" /> </button>
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/profil")}> <FaUserAlt size={24} className="nav-icon" /> </button>
        <div className="mt-auto mb-3">
          <button className="btn btn-dark nav-btn active-nav-icon" onClick={() => navigate("/beallitasok")}> <FaPencil size={24} className="nav-icon" /> </button>
        </div>
        <button onClick={handleLogout} className="btn nav-btn logout-btn mb-2"> <IoIosLogOut size={24} className="nav-icon logout-icon" /> </button>
      </div>

      <div className="flex-grow-1 ms-5 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Admin panel</h2>
          <ButtonGroup>
            <ToggleButton id="radio-events" type="radio" variant="outline-primary" name="view" value="events" checked={view === "events"} onChange={(e) => setView(e.currentTarget.value)}>Események</ToggleButton>
            <ToggleButton id="radio-rentals" type="radio" variant="outline-primary" name="view" value="rentals" checked={view === "rentals"} onChange={(e) => setView(e.currentTarget.value)}>Bérlések</ToggleButton>
            <ToggleButton id="radio-users" type="radio" variant="outline-primary" name="view" value="users" checked={view === "users"} onChange={(e) => setView(e.currentTarget.value)}>Felhasználók</ToggleButton>
          </ButtonGroup>
        </div>

        {view === "events" && (
          <div className="table-responsive mb-5" style={{ height: "calc(100vh - 200px)", overflowY: "auto" }}>
            <div className="d-flex justify-content-end mb-2">
              <Button variant="success" onClick={() => setShowAddEventModal(true)}>
                <AiOutlinePlus size={20} />
              </Button>
            </div>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Esemény</th>
                  <th>Kezdés</th>
                  <th>Befejezés</th>
                  <th>Szabad helyek</th>
                  <th>Foglalt helyek</th>
                  <th>Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td>{event.name}</td>
                    <td>{new Date(event.startDate).toLocaleString()}</td>
                    <td>{new Date(event.endDate).toLocaleString()}</td>
                    <td>{event.availablePLaces}</td>
                    <td>{event.reserved}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteEvent(event)}>
                        <FaTrash size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

<Modal show={showDeleteEventModal} onHide={() => setShowDeleteEventModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Esemény törlése</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Biztosan törölni szeretnéd ezt az eseményt?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteEventModal(false)}>Mégse</Button>
            <Button variant="danger" onClick={confirmDeleteEvent}>Törlés</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showAddEventModal} onHide={() => setShowAddEventModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Új esemény hozzáadása</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Név</Form.Label>
                <Form.Control type="text" value={newEvent.name} onChange={(e) => setNewEvent({...newEvent, name: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Kezdés</Form.Label>
                <Form.Control type="datetime-local" value={newEvent.startDate} onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Befejezés</Form.Label>
                <Form.Control type="datetime-local" value={newEvent.endDate} onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Szabad helyek</Form.Label>
                <Form.Control type="number" value={newEvent.availablePlaces} onChange={(e) => setNewEvent({...newEvent, availablePlaces: parseInt(e.target.value)})} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Szállás</Form.Label>
                <Form.Control type="number" value={newEvent.accommodation} onChange={(e) => setNewEvent({...newEvent, accommodation: parseInt(e.target.value)})} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Foglalt helyek</Form.Label>
                <Form.Control type="number" value={newEvent.reserved} onChange={(e) => setNewEvent({...newEvent, reserved: parseInt(e.target.value)})} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddEventModal(false)}>Mégse</Button>
            <Button variant="primary" onClick={handleAddEvent}>Hozzáadás</Button>
          </Modal.Footer>
        </Modal>

        {view === "rentals" && (
          <div className="table-responsive mb-5" style={{ height: "calc(100vh - 200px)", overflowY: "auto" }}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>UserID</th>
                  <th>eventID</th>
                  <th>feetSize</th>
                  <th>skateID</th>
                  <th>Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental) => (
                  <tr key={rental.id}>
                    <td>{rental.id}</td>
                    <td>{rental.userID}</td>
                    <td>{rental.eventID}</td>
                    <td>{rental.feetSize}</td>
                    <td>{rental.skateID}</td>
                    <td>
                      <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditRental(rental)}>
                        <FaPencil size={16} />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteRental(rental)}>
                        <FaTrash size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {view === "users" && (
          <div className="table-responsive mb-5" style={{ height: "calc(100vh - 200px)", overflowY: "auto" }}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Név</th>
                  <th>Email</th>
                  <th>Szerep</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.Name}</td>
                    <td>{u.Email}</td>
                    <td>{u.Role === 1 ? "Admin" : "Felhasználó"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <Modal show={showDeleteEventModal} onHide={() => setShowDeleteEventModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Esemény törlése</Modal.Title>
          </Modal.Header>
          <Modal.Body>Biztosan törölni szeretnéd ezt az eseményt?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteEventModal(false)}>Mégse</Button>
            <Button variant="danger" onClick={confirmDeleteEvent}>Törlés</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Bérlés törlése</Modal.Title>
          </Modal.Header>
          <Modal.Body>Biztosan törölni szeretnéd ezt a bérlést?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Mégse</Button>
            <Button variant="danger" onClick={confirmDeleteRental}>Törlés</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Bérlés szerkesztése</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editError && <Alert variant="danger">{editError}</Alert>}
            {editRental && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Lábméret</Form.Label>
                  <Form.Control
                    type="number"
                    value={editRental.feetSize}
                    onChange={(e) => setEditRental({ ...editRental, feetSize: parseInt(e.target.value) })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Korcsolya ID</Form.Label>
                  <Form.Control
                    type="number"
                    value={editRental.skateID}
                    onChange={(e) => setEditRental({ ...editRental, skateID: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Mégse</Button>
            <Button variant="primary" onClick={handleSaveRental}>Mentés</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
