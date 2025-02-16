
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Esemenyek from './components/esemenyek';
import SignUp from './components/SignUp';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/esemenyek" element={<Esemenyek />} />

      </Routes>
    </Router>
  );
}
