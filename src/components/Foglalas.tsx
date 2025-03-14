import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarAlt } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import React, { useState, useMemo } from "react";
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
  const username = localStorage.getItem("user") || "Felhasználó";
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

  // Új állapotok a korcsolya bérléshez
const [showRentalModal, setShowRentalModal] = useState(false);
const [selectedRentalEvent, setSelectedRentalEvent] = useState(null);
const [rentalRequested, setRentalRequested] = useState(false);

// Új state változók a modal kezeléséhez
const [skateType, setSkateType] = useState("soros");
const [skateSize, setSkateSize] = useState("");


// Mintapélda események, melyeket a kártyákban jelenítünk meg
const cardEvents = [
  {
    id: 1,
    title: "Görkori verseny",
    description: "Fedezd fel a görkorcsolyázás izgalmait!",
    startTime: "2024-04-01 10:00",
    endTime: "2024-04-01 14:00",
    ticketPrice: "5000 Ft",
  },
  {
    id: 2,
    title: "Éjszakai túra",
    description: "Tapasztald meg a város éjszakai életét görkorcsolyázva.",
    startTime: "2024-05-10 18:00",
    endTime: "2024-05-10 22:00",
    ticketPrice: "7000 Ft",
  },
  {
    id: 3,
    title: "Hétvégi verseny",
    description: "Vegyél részt a hétvégi korcsolya versenyen!",
    startTime: "2024-06-15 09:00",
    endTime: "2024-06-15 12:00",
    ticketPrice: "6000 Ft",
  },
  {
    id: 1,
    title: "Görkori verseny",
    description: "Fedezd fel a görkorcsolyázás izgalmait!",
    startTime: "2024-04-01 10:00",
    endTime: "2024-04-01 14:00",
    ticketPrice: "5000 Ft",
  },
  {
    id: 2,
    title: "Éjszakai túra",
    description: "Tapasztald meg a város éjszakai életét görkorcsolyázva.",
    startTime: "2024-05-10 18:00",
    endTime: "2024-05-10 22:00",
    ticketPrice: "7000 Ft",
  },
  {
    id: 3,
    title: "Hétvégi verseny",
    description: "Vegyél részt a hétvégi korcsolya versenyen!",
    startTime: "2024-06-15 09:00",
    endTime: "2024-06-15 12:00",
    ticketPrice: "6000 Ft",
  },
  {
    id: 1,
    title: "Görkori verseny",
    description: "Fedezd fel a görkorcsolyázás izgalmait!",
    startTime: "2024-04-01 10:00",
    endTime: "2024-04-01 14:00",
    ticketPrice: "5000 Ft",
  },
  {
    id: 2,
    title: "Éjszakai túra",
    description: "Tapasztald meg a város éjszakai életét görkorcsolyázva.",
    startTime: "2024-05-10 18:00",
    endTime: "2024-05-10 22:00",
    ticketPrice: "7000 Ft",
  },
  {
    id: 3,
    title: "Hétvégi verseny",
    description: "Vegyél részt a hétvégi korcsolya versenyen!",
    startTime: "2024-06-15 09:00",
    endTime: "2024-06-15 12:00",
    ticketPrice: "6000 Ft",
  },
];


  return (
    <div className="d-flex vh-100">
      {/* Oldalsó menü (Navbar) */}
      <div className="d-flex flex-column bg-dark text-white p-2 position-fixed top-0 start-0 h-100 align-items-center navbar-container">
        <button className="btn btn-dark mb-3 nav-btn" onClick={() => navigate("/dashboard")}>
          <RiDashboard3Fill size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn " onClick={() => navigate("/esemenyek")}>
          <FaCalendarAlt size={24} className="nav-icon" />
        </button>
        <button className="btn btn-dark mb-3 nav-btn active-nav-icon" onClick={() => navigate("/berlesek")}>
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
        {/* Fő tartalom */}
<div className="flex-grow-1 p-4" style={{ marginLeft: "5%", height: "100vh", overflowY: "auto" }}>
  <div className="container">
    <div className="row">
      {cardEvents.map((event) => (
        <div key={event.id} className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{event.title}</h5>
              <p className="card-text">{event.description}</p>
              <p className="card-text"><strong>Kezdés:</strong> {event.startTime}</p>
              <p className="card-text"><strong>Befejezés:</strong> {event.endTime}</p>
              <p className="card-text"><strong>Jegyár:</strong> {event.ticketPrice}</p>
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedRentalEvent(event);
                  setShowRentalModal(true);
                }}
              >
                Jegyvásárlás
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

      {/* Korcsolya bérlés Modal */}
<Modal show={showRentalModal} onHide={() => setShowRentalModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Jegyvásárlás és bérlés</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedRentalEvent && (
      <Form>
        <h5>{selectedRentalEvent.title}</h5>
        <p>{selectedRentalEvent.description}</p>
        <p><strong>Kezdés:</strong> {selectedRentalEvent.startTime}</p>
        <p><strong>Befejezés:</strong> {selectedRentalEvent.endTime}</p>
        <p><strong>Jegyár:</strong> {selectedRentalEvent.ticketPrice}</p>
        <Form.Check
          type="checkbox"
          label="Igen, szeretnék korcsolyát bérelni"
          checked={rentalRequested}
          onChange={(e) => setRentalRequested(e.target.checked)}
        />
        {rentalRequested && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Korcsolya típusa</Form.Label>
              <Form.Select
                value={skateType}
                onChange={(e) => setSkateType(e.target.value)}
              >
                <option value="soros">Soros</option>
                <option value="négykerekű">Négykerekű</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Méret</Form.Label>
              <Form.Control
                type="text"
                value={skateSize}
                onChange={(e) => setSkateSize(e.target.value)}
                placeholder="Add meg a méretet"
              />
            </Form.Group>
          </>
        )}
      </Form>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowRentalModal(false)}>
      Mégse
    </Button>
    <Button
      variant="primary"
      onClick={() => {
        console.log(`Korcsolya bérlés: ${rentalRequested ? "igen" : "nem"}`);
        if (rentalRequested) {
          console.log(`Kiválasztott típus: ${skateType}, Méret: ${skateSize}`);
        }
        // Itt végezheted el a mentési logikát (például API hívás)
        setShowRentalModal(false);
        setRentalRequested(false);
        setSkateType("soros");
        setSkateSize("");
      }}
    >
      Jegyvásárlás
    </Button>
  </Modal.Footer>
</Modal>




</div>


    </div>
  );
}
