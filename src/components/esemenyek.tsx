import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { useState, useMemo } from "react";
import { FaPencilAlt, FaTrash, FaPlus } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";

interface Event {
  id: number;
  esemény: string;
  dátum: string;
  berles?: boolean; 
}

type SortDirection = "asc" | "desc" | "default";

// Ez a 4 esemény jelenik meg a táblázatban kezdetben
const alapEsemenyek: Event[] = [
  { id: 1, esemény: "Görkori verseny", dátum: "2024-04-01", berles: true },
  { id: 2, esemény: "Éjszakai túra", dátum: "2024-05-10", berles: false },
  { id: 3, esemény: "Hétvégi verseny", dátum: "2024-06-15", berles: true },
  { id: 4, esemény: "Közösségi görkorizás", dátum: "2024-07-05", berles: false },
];

// Ez a lista adja a "rögzített eseményeket" a lenyíló menühöz
// (akár megegyezhet az alapEsemenyek tartalmával, vagy lehet bővebb)
const valaszthatoEsemenyek: Omit<Event, "berles">[] = [
  { id: 1, esemény: "Görkori verseny", dátum: "2024-04-01" },
  { id: 2, esemény: "Éjszakai túra", dátum: "2024-05-10" },
  { id: 3, esemény: "Hétvégi verseny", dátum: "2024-06-15" },
  { id: 4, esemény: "Közösségi görkorizás", dátum: "2024-07-05" },
];

export default function Esemenyek() {
  const navigate = useNavigate();

  // Alapértelmezett adat: 4 sor a táblázatban
  const [data, setData] = useState<Event[]>(alapEsemenyek);

  // Egyedi azonosító növelése, ha új sort adunk hozzá
  // (hogy ne ütközzön a meglévő 1-4-es ID-kal, kezdhetjük pl. 5-tel)
  const [nextUniqueId, setNextUniqueId] = useState<number>(5);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Az éppen szerkesztett/törlendő esemény
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // A lenyíló menüben kiválasztott esemény ID-je
  const [newEventId, setNewEventId] = useState<number>(0);

  // Checkbox, hogy bérlést kér-e
  const [rentRequested, setRentRequested] = useState<boolean>(false);

  // Rendezés beállításai
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection }>({
    key: "",
    direction: "default",
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleSort = (key: string) => {
    if (sortConfig.key !== key) {
      // Ha más oszlopra kattintunk, először növekvő sorrend
      setSortConfig({ key, direction: "asc" });
    } else {
      // Ugyanarra kattintva: asc -> desc -> default
      if (sortConfig.direction === "asc") {
        setSortConfig({ key, direction: "desc" });
      } else if (sortConfig.direction === "desc") {
        setSortConfig({ key: "", direction: "default" });
      } else {
        setSortConfig({ key, direction: "asc" });
      }
    }
  };

  // A rendezett adatok kiszámolása a sortConfig alapján
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key && sortConfig.direction !== "default") {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof Event];
        const bVal = b[sortConfig.key as keyof Event];

        // Számok rendezése
        if (typeof aVal === "number" && typeof bVal === "number") {
          return aVal - bVal;
        }
        // Boolean rendezés
        if (typeof aVal === "boolean" && typeof bVal === "boolean") {
          return aVal === bVal ? 0 : aVal ? 1 : -1;
        }
        // Egyébként stringként rendezünk (pl. esemény neve, dátum)
        return (aVal as string).localeCompare(bVal as string);
      });
      if (sortConfig.direction === "desc") {
        sortableItems.reverse();
      }
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Szerkesztés
  const handleEdit = (event: Event) => {
    setSelectedEvent({ ...event });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (selectedEvent) {
      // Csak a bérlés mezőt módosítjuk (vagy további mezőket is, ha szeretnénk)
      setData(
        data.map((item) =>
          item.id === selectedEvent.id ? { ...item, berles: selectedEvent.berles } : item
        )
      );
      setShowEditModal(false);
    }
  };

  // Törlés
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

  // Új esemény hozzáadása
  const handleAddEvent = () => {
    setShowAddModal(true);
  };

  // Mentés az Új esemény modalban
  // Csak rögzített eseményekből lehet választani
  const saveNewEvent = () => {
    if (newEventId > 0) {
      // Megkeressük a kiválasztott eseményt
      const chosen = valaszthatoEsemenyek.find((e) => e.id === newEventId);
      if (chosen) {
        // Létrehozunk egy új sort, egyedi ID-val
        const newRow: Event = {
          id: nextUniqueId,
          esemény: chosen.esemény,
          dátum: chosen.dátum,
          berles: rentRequested,
        };
        setData([...data, newRow]);
        setNextUniqueId(nextUniqueId + 1);
      }
    }
    // Modal bezárása és mezők alaphelyzetbe állítása
    setShowAddModal(false);
    setNewEventId(0);
    setRentRequested(false);
  };

  return (
    <div className="d-flex vh-100">
      {/* Oldalsó menü (Navbar) */}
      <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center navbar-container">
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/dashboard")}>
          <RiDashboard3Fill size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn active-nav-icon" onClick={() => navigate("/esemenyek")}>
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

      {/* Fő tartalom */}
      <div className="flex-grow-1 p-4 position-relative" style={{ marginLeft: "5%" }}>
        <h2>Aktív események</h2>

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
                <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                  ID{" "}
                  {sortConfig.key === "id" &&
                    sortConfig.direction !== "default" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("esemény")} style={{ cursor: "pointer" }}>
                  Esemény{" "}
                  {sortConfig.key === "esemény" &&
                    sortConfig.direction !== "default" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("dátum")} style={{ cursor: "pointer" }}>
                  Dátum{" "}
                  {sortConfig.key === "dátum" &&
                    sortConfig.direction !== "default" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("berles")} style={{ cursor: "pointer" }}>
                  Bérlés{" "}
                  {sortConfig.key === "berles" &&
                    sortConfig.direction !== "default" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.esemény}</td>
                  <td>{row.dátum}</td>
                  <td>
                    {row.berles ? (
                      <span className="badge bg-success">Kértél eszközt</span>
                    ) : (
                      <span className="badge bg-primary">Saját eszközt hozol</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(row)}
                    >
                      <FaPencilAlt />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(row)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Új esemény hozzáadása Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Új esemény hozzáadása</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {/* Lenyíló lista: csak a rögzített események közül lehet választani */}
              <Form.Group className="mb-3">
                <Form.Label>Válassz eseményt</Form.Label>
                <Form.Select
                  value={newEventId}
                  onChange={(e) => setNewEventId(Number(e.target.value))}
                >
                  <option value={0}>Válassz egy eseményt...</option>
                  {valaszthatoEsemenyek.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.esemény} - {e.dátum}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Kérsz eszközt?"
                  checked={rentRequested}
                  onChange={(e) => setRentRequested(e.target.checked)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Mégse
            </Button>
            <Button variant="primary" onClick={saveNewEvent}>
              Hozzáadás
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Szerkesztés Modal */}
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
                  <Form.Check
                    type="checkbox"
                    label="Kérsz eszközt?"
                    checked={selectedEvent.berles || false}
                    onChange={(e) =>
                      setSelectedEvent({ ...selectedEvent, berles: e.target.checked })
                    }
                  />
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Mégse
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Mentés
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Törlés Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Törlés megerősítése</Modal.Title>
          </Modal.Header>
          <Modal.Body>Biztosan törölni szeretnéd ezt az eseményt?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Mégse
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Törlés
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
