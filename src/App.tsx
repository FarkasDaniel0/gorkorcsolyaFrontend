
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Esemenyek from './components/esemenyek';
import SignUp from './components/SignUp';
import Foglalas from './components/Foglalas';
import Profil from './components/Profil';
import Admin from './components/Admin';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/esemenyek" element={<Esemenyek />} />
        <Route path="/foglalas" element={<Foglalas />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/beallitasok" element={<Admin />} />

      </Routes>
    </Router>
  );
}
