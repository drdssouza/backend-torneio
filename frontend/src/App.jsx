import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Category from './pages/Category';
import ManageTeams from './pages/ManageTeams';
import ManageTournaments from './pages/ManageTournaments';
import Ranking from './pages/Ranking';
import { useStore } from './store/useStore';

export default function App() {
  const { isAuthenticated } = useStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/categoria/:category/:gender" element={<Category />} />
        <Route path="/ranking" element={<Ranking />} />
        
        {/* Rotas protegidas (apenas admin) */}
        <Route 
          path="/gerenciar-duplas/:category/:gender" 
          element={isAuthenticated ? <ManageTeams /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/gerenciar-torneios" 
          element={isAuthenticated ? <ManageTournaments /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}