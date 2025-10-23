import * as tournamentService from '../services/tournamentService.js';

export const getActiveTournament = async (req, res) => {
  try {
    const tournament = await tournamentService.getActiveTournament();
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await tournamentService.getAllTournaments();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTournament = async (req, res) => {
  try {
    const { name, date } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nome do torneio é obrigatório' });
    }
    
    const tournament = await tournamentService.createTournament(name, date);
    res.json(tournament);
  } catch (error) {
    console.error('Erro ao criar torneio:', error);
    res.status(500).json({ error: error.message });
  }
};

export const setActiveTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await tournamentService.setActiveTournament(parseInt(id));
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;
    await tournamentService.deleteTournament(parseInt(id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};