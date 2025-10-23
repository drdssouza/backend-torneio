import { useState } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import Category from './pages/Category';
import ManageTeams from './pages/ManageTeams';
import ManageTournaments from './pages/ManageTournaments';
import Ranking from './pages/Ranking';
import { useStore } from './store/useStore';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showLogin, setShowLogin] = useState(false);
  const [manageTeamsData, setManageTeamsData] = useState({ category: null, gender: null });
  const { isAuthenticated, setCategory, setGender, setActiveTab } = useStore();

  const handleLogin = () => {
    setShowLogin(false);
    setCurrentPage('home');
  };

  const handleSelectCategory = (cat, gender) => {
    setCategory(cat);
    setGender(gender);
    setActiveTab('grupos');
    setCurrentPage('category');
  };

  const handleManageTeams = (cat, gender) => {
    if (!isAuthenticated) {
      alert('Você precisa fazer login para gerenciar duplas!');
      setShowLogin(true);
      return;
    }
    setManageTeamsData({ category: cat, gender });
    setCurrentPage('manageTeams');
  };

  const handleManageTournaments = () => {
    if (!isAuthenticated) {
      alert('Você precisa fazer login!');
      setShowLogin(true);
      return;
    }
    setCurrentPage('manageTournaments');
  };

  const handleShowRanking = () => {
    setCurrentPage('ranking');
  };

  const handleBack = () => {
    setCurrentPage('home');
  };

  const handleShowLogin = () => {
    setShowLogin(true);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  if (showLogin) {
    return <Login onLogin={handleLogin} onClose={handleCloseLogin} />;
  }

  return (
    <>
      {currentPage === 'home' && (
        <Home 
          onSelectCategory={handleSelectCategory}
          onManageTeams={handleManageTeams}
          onManageTournaments={handleManageTournaments}
          onShowLogin={handleShowLogin}
          onShowRanking={handleShowRanking}
        />
      )}
      {currentPage === 'category' && <Category onBack={handleBack} />}
      {currentPage === 'manageTeams' && (
        <ManageTeams 
          category={manageTeamsData.category}
          gender={manageTeamsData.gender}
          onBack={handleBack}
        />
      )}
      {currentPage === 'manageTournaments' && (
        <ManageTournaments onBack={handleBack} />
      )}
      {currentPage === 'ranking' && <Ranking onBack={handleBack} />}
    </>
  );
}