import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Kepteszt from './components/kepteszt';
import SignUp from './components/SignUp';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kepteszt" element={<Kepteszt />} />
        <Route path="/SignUp" element={<SignUp />} />
      </Routes>
    </Router>
  );
}
