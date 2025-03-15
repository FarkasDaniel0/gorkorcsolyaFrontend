import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { AiOutlinePlus } from "react-icons/ai";
import { useState, useEffect, useMemo } from "react";
import { Form, Button, Table, Modal } from "react-bootstrap";

export default function Admin() {
  const navigate = useNavigate();

  // Egyszerű email validáció

  interface Event {
    id: number;
    name: string;
    date: string;
    description: string;
  }

  interface Rental {
    id: number;
    item: string;
    date: string;
  }

  interface User {
    id: number;
    Name: string;
    Email: string;
    Role: number;
    Password?: string;
  }

  interface SortConfig {
    key: string | null;
    direction: "asc" | "desc" | "default";
  }

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validáció: Minden esetben kötelező a név, a helyes formátumú email és a jelszó.
  const [userForm, setUserForm] = useState({ username: "", email: "", role: 0, password: "" });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const isUserFormValid = () => {
    if (userForm.username.trim() === "") return false;
    if (!validateEmail(userForm.email)) return false;
    if (userForm.password.trim() === "") return false;
    return true;
  };

  // Aktív nézet: "events", "rentals", vagy "users"
  const [activeView, setActiveView] = useState("events");

  // Dummy adatok az események és bérlések részére
  const [events, setEvents] = useState([
    { id: 1, name: "Görkori verseny", date: "2024-04-01", description: "Izgalmas verseny az új szezonban." },
    { id: 2, name: "Éjszakai túra", date: "2024-05-10", description: "Fedezd fel a város éjszakai arcát!" },
    { id: 3, name: "Hétvégi verseny", date: "2024-06-15", description: "Csatlakozz a hétvégi kihíváshoz!" }
  ]);

  const [rentals, setRentals] = useState([
    { id: 1, item: "Korcsolya Bérlés 1", date: "2024-04-15" },
    { id: 2, item: "Korcsolya Bérlés 2", date: "2024-05-20" }
  ]);

  // Felhasználók API adatai – alapból üres tömb
  const [users, setUsers] = useState<User[]>([]);

  // Kereső mező állapota (név és email alapján)
  const [searchTerm, setSearchTerm] = useState("");

  // sortConfig a felhasználók táblázat rendezéséhez (ID, Név, Email, Szerep)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "default" });
  const sortedUsers = useMemo(() => {
    if (!sortConfig.key || sortConfig.direction === "default") {
      return users;
    }
    const sorted = [...users];
    sorted.sort((a: User, b: User) => {
      let aVal: string | number = "", bVal: string | number = "";
      if (sortConfig.key === "id") {
        aVal = a.id;
        bVal = b.id;
      } else if (sortConfig.key === "Name") {
        aVal = a.Name.toLowerCase();
        bVal = b.Name.toLowerCase();
      } else if (sortConfig.key === "Email") {
        aVal = a.Email.toLowerCase();
        bVal = b.Email.toLowerCase();
      } else if (sortConfig.key === "Role") {
        aVal = a.Role;
        bVal = b.Role;
      }
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [users, sortConfig]);

  // Szűrt felhasználók lista a keresőmező alapján (csak név és email)
  const filteredUsers = useMemo(() => {
    if (searchTerm.trim() === "") return sortedUsers;
    return sortedUsers.filter((u: User) =>
      u.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.Email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedUsers, searchTerm]);

  // Függvény a rendezéshez
  const requestSort = (key: string): void => {
    let direction: "asc" | "desc" | "default" = "asc";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = "default";
      }
    }
    setSortConfig({ key, direction });
  };

  // ---------------------------
  // Események (Events) modális állapotok
  // ---------------------------
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({ name: "", date: "", description: "" });
  const handleSaveEvent = () => {
    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...e, ...eventForm } : e));
    } else {
      const newId = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;
      setEvents([...events, { id: newId, ...eventForm }]);
    }
    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm({ name: "", date: "", description: "" });
  };
  const handleEditEvent = (ev: Event) => {
    setEditingEvent(ev);
    setEventForm({ name: ev.name, date: ev.date, description: ev.description });
    setShowEventModal(true);
  };

  const handleDeleteEvent = (ev: Event): void => {
    setDeleteItemType("event");
    setDeleteItem(ev);
    setShowDeleteConfirmModal(true);
  };

  // ---------------------------
  // Bérlések (Rentals) modális állapotok
  // ---------------------------
  const handleDeleteRental = (rental: Rental): void => {
    setDeleteItemType("rental");
    setDeleteItem(rental);
    setShowDeleteConfirmModal(true);
  };
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [rentalForm, setRentalForm] = useState({ item: "", date: "" });
  const handleSaveRental = () => {
    if (editingRental) {
      setRentals(rentals.map(r => r.id === editingRental.id ? { ...r, ...rentalForm } : r));
    } else {
      const newId = rentals.length ? Math.max(...rentals.map(r => r.id)) + 1 : 1;
      setRentals([...rentals, { id: newId, ...rentalForm }]);
    }
    setShowRentalModal(false);
    setEditingRental(null);
    setRentalForm({ item: "", date: "" });
  };

  // ---------------------------
  // Felhasználók (Users) modális állapotok
  // ---------------------------
  // A userForm tartalmazza a jelszót is.
  // Szerkesztéskor az API-ból lekéri a felhasználó teljes adatait,
  // majd a modalban a jelszó mező betöltődik, de ezután a jelszó mezőnek nem lehet üres a mentéshez.
  const [showUserModal, setShowUserModal] = useState(false);
  const handleSaveUser = () => {
    if (editingUser) {
      const updatedUser: User = { 
        id: editingUser.id,
        Name: userForm.username, 
        Email: userForm.email, 
        Role: userForm.role,
        Password: userForm.password.trim() !== "" ? userForm.password : undefined
      };
      fetch(`https://api-generator.retool.com/NnWL2O/felhasznalok/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser)
      })
        .then(response => response.json())
        .then(data => {
          setUsers(users.map(u => u.id === editingUser.id ? data : u));
          setShowUserModal(false);
          setEditingUser(null);
          setUserForm({ username: "", email: "", role: 0, password: "" });
        })
        .catch(error => console.error("Hiba a felhasználó módosításakor:", error));
    } else {
      const newUser = { 
        Name: userForm.username, 
        Email: userForm.email, 
        Role: userForm.role,
        Password: userForm.password 
      };
      fetch("https://api-generator.retool.com/NnWL2O/felhasznalok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      })
        .then(response => response.json())
        .then(data => {
          setUsers([...users, data]);
          setShowUserModal(false);
          setUserForm({ username: "", email: "", role: 0, password: "" });
        })
        .catch(error => console.error("Hiba a felhasználó hozzáadásakor:", error));
    }
  };
  const handleEditUser = (u: User) => {
    setEditingUser(u);
    fetch(`https://api-generator.retool.com/NnWL2O/felhasznalok/${u.id}`)
      .then(response => response.json())
      .then(data => {
        setUserForm({ 
          username: data.Name, 
          email: data.Email, 
          role: data.Role, 
          password: data.Password || "" 
        });
        setShowUserModal(true);
      })
      .catch(error => console.error("Hiba a felhasználó adatok lekérésénél:", error));
  };
  const handleDeleteUser = (u: User) => {
    setDeleteItemType("user");
    setDeleteItem(u);
    setShowDeleteConfirmModal(true);
  };

  // ---------------------------
  // Törlés megerősítő modal állapotai
  // ---------------------------
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState(""); // "event", "rental", "user"
  const [deleteItem, setDeleteItem] = useState<Event | Rental | User | null>(null);

  // ---------------------------
  // Felhasználók API hívása, ha az aktív nézet "users"
  // ---------------------------
  useEffect(() => {
    if (activeView === "users") {
      fetch("https://api-generator.retool.com/NnWL2O/felhasznalok")
        .then(response => response.json())
        .then(data => setUsers(data))
        .catch(error => console.error("Hiba az API hívás során:", error));
    }
  }, [activeView]);

  // ---------------------------
  // Kijelentkezés
  // ---------------------------
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    navigate("/");
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
        <button className="btn btn-dark mb-3 nav-btn " onClick={() => navigate("/profil")}>
          <FaUserAlt size={24} className="nav-icon" />
        </button>
        <div className="mt-auto mb-3">
          <button className="btn btn-dark nav-btn active-nav-icon" onClick={() => navigate("/beallitasok")}>
            <FaPencil size={24} className="nav-icon" />
          </button>
        </div>
        <button onClick={handleLogout} className="btn nav-btn logout-btn mb-2">
          <IoIosLogOut size={24} className="nav-icon logout-icon" />
        </button>
      </div>

      {/* Fő tartalom */}
      <div className="flex-grow-1 ms-5 p-3">
        <div className="mb-3">
          <Button variant={activeView === "events" ? "primary" : "secondary"} className="me-2" onClick={() => setActiveView("events")}>
            Események
          </Button>
          <Button variant={activeView === "rentals" ? "primary" : "secondary"} className="me-2" onClick={() => setActiveView("rentals")}>
            Bérlések
          </Button>
          <Button variant={activeView === "users" ? "primary" : "secondary"} onClick={() => setActiveView("users")}>
            Felhasználók
          </Button>
        </div>

        {activeView === "events" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Események</h2>
              <Button variant="success" onClick={() => { setEditingEvent(null); setEventForm({ name: "", date: "", description: "" }); setShowEventModal(true); }}>
                <AiOutlinePlus size={20} />
              </Button>
            </div>
            <div className="table-responsive" style={{ height: "calc(100vh - 150px)", overflowY: "auto" }}>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Név</th>
                    <th>Dátum</th>
                    <th>Leírás</th>
                    <th>Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>{event.id}</td>
                      <td>{event.name}</td>
                      <td>{event.date}</td>
                      <td>{event.description}</td>
                      <td>
                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditEvent(event)}>
                          <FaPencil size={16} />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteEvent(event)}>
                          <FaTrash size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {activeView === "rentals" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Bérlések</h2>
              <Button variant="success" onClick={() => { setEditingRental(null); setRentalForm({ item: "", date: "" }); setShowRentalModal(true); }}>
                <AiOutlinePlus size={20} />
              </Button>
            </div>
            <div className="table-responsive" style={{ height: "calc(100vh - 150px)", overflowY: "auto" }}>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Item</th>
                    <th>Dátum</th>
                    <th>Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((rental) => (
                    <tr key={rental.id}>
                      <td>{rental.id}</td>
                      <td>{rental.item}</td>
                      <td>{rental.date}</td>
                      <td>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteRental(rental)}>
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
          </div>
        )}

        {activeView === "users" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Felhasználók</h2>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="text"
                  placeholder="Keresés név vagy email alapján"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "300px" }}
                  className="me-2"
                />
                <Button variant="success" onClick={() => { setEditingUser(null); setUserForm({ username: "", email: "", role: 0, password: "" }); setShowUserModal(true); }}>
                  <AiOutlinePlus size={20} />
                </Button>
              </div>
            </div>
            <div className="table-responsive" style={{ height: "calc(100vh - 150px)", overflowY: "auto" }}>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th onClick={() => requestSort("id")} style={{ cursor: "pointer" }}>
                      ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "▲" : sortConfig.direction === "desc" ? "▼" : "")}
                    </th>
                    <th onClick={() => requestSort("Name")} style={{ cursor: "pointer" }}>
                      Név {sortConfig.key === "Name" && (sortConfig.direction === "asc" ? "▲" : sortConfig.direction === "desc" ? "▼" : "")}
                    </th>
                    <th onClick={() => requestSort("Email")} style={{ cursor: "pointer" }}>
                      Email {sortConfig.key === "Email" && (sortConfig.direction === "asc" ? "▲" : sortConfig.direction === "desc" ? "▼" : "")}
                    </th>
                    <th onClick={() => requestSort("Role")} style={{ cursor: "pointer" }}>
                      Szerep {sortConfig.key === "Role" && (sortConfig.direction === "asc" ? "▲" : sortConfig.direction === "desc" ? "▼" : "")}
                    </th>
                    <th>Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.Name}</td>
                      <td>{user.Email}</td>
                      <td>{user.Role === 1 ? "Admin" : "Felhasználó"}</td>
                      <td>
                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditUser(user)}>
                          <FaPencil size={16} />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user)}>
                          <FaTrash size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Esemény Modal */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingEvent ? "Esemény szerkesztése" : "Új esemény hozzáadása"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formEventName">
              <Form.Label>Név</Form.Label>
              <Form.Control
                type="text"
                placeholder="Add meg az esemény nevét"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formEventDate" className="mt-2">
              <Form.Label>Dátum</Form.Label>
              <Form.Control
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formEventDescription" className="mt-2">
              <Form.Label>Leírás</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add meg az esemény leírását"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEventModal(false)}>Mégse</Button>
          <Button variant="primary" onClick={handleSaveEvent}>Mentés</Button>
        </Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEventModal(false)}>Mégse</Button>
          <Button variant="primary" onClick={handleSaveEvent}>Mentés</Button>
      {/* Bérlés Modal */}
      <Modal show={showRentalModal} onHide={() => setShowRentalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingRental ? "Bérlés szerkesztése" : "Új bérlés hozzáadása"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formRentalItem">
              <Form.Label>Item</Form.Label>
              <Form.Control
                type="text"
                placeholder="Add meg a bérlés tárgyát"
                value={rentalForm.item}
                onChange={(e) => setRentalForm({ ...rentalForm, item: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formRentalDate" className="mt-2">
              <Form.Label>Dátum</Form.Label>
              <Form.Control
                type="date"
                value={rentalForm.date}
                onChange={(e) => setRentalForm({ ...rentalForm, date: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRentalModal(false)}>Mégse</Button>
          <Button variant="primary" onClick={handleSaveRental}>Mentés</Button>
        </Modal.Footer>
      </Modal>

      {/* Felhasználó Modal */}
      </Modal>

      {/* Felhasználó Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? "Felhasználó szerkesztése" : "Új felhasználó hozzáadása"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formUserName">
              <Form.Label>Felhasználónév</Form.Label>
              <Form.Control
                type="text"
                placeholder="Add meg a felhasználó nevét"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formUserEmail" className="mt-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Add meg a felhasználó email címét"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formUserPassword" className="mt-2">
              <Form.Label>Jelszó</Form.Label>
              <Form.Control
                type="password"
                placeholder="Add meg a jelszót (csak ha módosítani szeretnéd)"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formUserRole" className="mt-2">
              <Form.Label>Szerep</Form.Label>
              <Form.Select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: parseInt(e.target.value) })}
              >
                <option value={0}>Felhasználó</option>
                <option value={1}>Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>Mégse</Button>
          <Button variant="primary" onClick={handleSaveUser} disabled={!isUserFormValid()}>
            Mentés
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Törlés megerősítő Modal */}
      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Megerősítés</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Biztosan törölni szeretnéd a {deleteItemType === "event" ? "eseményt" : deleteItemType === "rental" ? "bérlést" : "felhasználót"}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>Mégse</Button>
            <Button variant="danger" onClick={() => {
              if (deleteItemType === "event" && deleteItem) {
                setEvents(events.filter(e => e.id !== deleteItem.id));
              } else if (deleteItemType === "rental" && deleteItem) {
                setRentals(rentals.filter(r => r.id !== deleteItem.id));
              } else if (deleteItemType === "user" && deleteItem) {
                fetch(`https://api-generator.retool.com/NnWL2O/felhasznalok/${deleteItem.id}`, { method: "DELETE" })
                  .then(response => {
                    if (response.ok) {
                      setUsers(users.filter(u => u.id !== deleteItem.id));
                    } else {
                      console.error("Hiba a felhasználó törlésekor");
                    }
                  })
                  .catch(error => console.error("Hiba a felhasználó törlésekor:", error));
              }
              setShowDeleteConfirmModal(false);
            }}>Igen</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
