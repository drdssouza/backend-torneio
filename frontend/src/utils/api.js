const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = {
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  getClubs: async () => {
    const res = await fetch(`${API_URL}/clubs`);
    return res.json();
  },
  calculateRanking: async () => {
    const res = await fetch(`${API_URL}/ranking/calculate`, {
      method: 'POST'
    });
    return res.json();
  },

  getRanking: async () => {
    const res = await fetch(`${API_URL}/ranking`);
    return res.json();
  },

  getDetailedRanking: async (clubName) => {
    const res = await fetch(`${API_URL}/ranking/${encodeURIComponent(clubName)}`);
    return res.json();
  },

  createTeam: async (player1, player2, clubId, category, gender) => {
    const res = await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player1, player2, clubId, category, gender })
    });
    return res.json();
  },

  getTeams: async (category, gender) => {
    const res = await fetch(`${API_URL}/teams/${category}/${gender}`);
    return res.json();
  },

  deleteTeam: async (id) => {
    const res = await fetch(`${API_URL}/teams/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  generateGroups: async (category, gender) => {
    const res = await fetch(`${API_URL}/groups/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, gender })
    });
    return res.json();
  },

  getGroups: async (category, gender) => {
    const res = await fetch(`${API_URL}/groups/${category}/${gender}`);
    return res.json();
  },

  getMatches: async (category, gender) => {
    const res = await fetch(`${API_URL}/matches/${category}/${gender}`);
    return res.json();
  },
  
  updateMatch: async (id, score1, score2) => {
    const res = await fetch(`${API_URL}/matches/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score1, score2 })
    });
    return res.json();
  },

  generateElimination: async (category, gender) => {
    const res = await fetch(`${API_URL}/elimination/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, gender })
    });
    return res.json();
  },

  getElimination: async (category, gender) => {
    const res = await fetch(`${API_URL}/elimination/${category}/${gender}`);
    return res.json();
  },

  advanceWinner: async (id, score1, score2) => {
    const res = await fetch(`${API_URL}/elimination/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score1, score2 })
    });
    return res.json();
  }
};