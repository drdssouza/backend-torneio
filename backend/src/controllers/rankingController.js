import * as rankingService from '../services/rankingService.js';
import * as tournamentService from '../services/tournamentService.js';

export const calculateRanking = async (req, res) => {
  try {
    const tournament = await tournamentService.getActiveTournament();
    if (!tournament) {
      return res.status(404).json({ error: 'Nenhum torneio ativo' });
    }
    const ranking = await rankingService.calculatePoints(tournament.id);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getArenaRanking = async (req, res) => {
  try {
    const tournament = await tournamentService.getActiveTournament();
    if (!tournament) {
      return res.status(404).json({ error: 'Nenhum torneio ativo' });
    }
    const ranking = await rankingService.getArenaRanking(tournament.id);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDetailedRanking = async (req, res) => {
  try {
    const { clubName } = req.params;
    const tournament = await tournamentService.getActiveTournament();
    if (!tournament) {
      return res.status(404).json({ error: 'Nenhum torneio ativo' });
    }
    const ranking = await rankingService.getDetailedRanking(tournament.id, clubName);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};