import * as groupService from '../services/groupService.js';
import * as tournamentService from '../services/tournamentService.js';

export const generateGroups = async (req, res) => {
  try {
    const { category, gender } = req.body;
    const tournament = await tournamentService.getActiveTournament();
    if (!tournament) {
      return res.status(404).json({ error: 'Nenhum torneio ativo' });
    }
    const groups = await groupService.generateGroups(category, gender, tournament.id);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const { category, gender } = req.params;
    const tournament = await tournamentService.getActiveTournament();
    if (!tournament) {
      return res.status(404).json({ error: 'Nenhum torneio ativo' });
    }
    const groups = await groupService.getGroups(category, gender, tournament.id);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};