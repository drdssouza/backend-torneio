import * as eliminationService from '../services/eliminationService.js';
import * as tournamentService from '../services/tournamentService.js';

export const generateElimination = async (req, res) => {
  try {
    const { category, gender } = req.body;
    const tournament = await tournamentService.getActiveTournament();
    if (!tournament) {
      return res.status(404).json({ error: 'Nenhum torneio ativo' });
    }
    const matches = await eliminationService.generateElimination(category, gender, tournament.id);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getElimination = async (req, res) => {
  try {
    const { category, gender } = req.params;
    const tournament = await tournamentService.getActiveTournament();
    if (!tournament) {
      return res.status(404).json({ error: 'Nenhum torneio ativo' });
    }
    const matches = await eliminationService.getElimination(category, gender, tournament.id);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const advanceWinner = async (req, res) => {
  try {
    const { id } = req.params;
    const { score1, score2 } = req.body;
    const match = await eliminationService.advanceWinner(parseInt(id), score1, score2);
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};