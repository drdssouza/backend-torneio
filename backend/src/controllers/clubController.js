import * as clubService from '../services/clubService.js';
import * as tournamentService from '../services/tournamentService.js';

export const getClubs = async (req, res) => {
  try {
    const tournament = await tournamentService.getActiveTournament();
    if (!tournament) {
      return res.status(404).json({ error: 'Nenhum torneio ativo' });
    }
    const clubs = await clubService.getClubs(tournament.id);
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};