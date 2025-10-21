import * as teamService from '../services/teamService.js';
import * as tournamentService from '../services/tournamentService.js';

export const createTeam = async (req, res) => {
  try {
    const { player1, player2, clubId, category, gender } = req.body;
    const tournament = await tournamentService.getActiveTournament();
    if (!tournament) {
      return res.status(404).json({ error: 'Nenhum torneio ativo' });
    }
    const team = await teamService.createTeam(player1, player2, clubId, category, gender, tournament.id);
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const { category, gender } = req.params;
    const tournament = await tournamentService.getActiveTournament();
    if (!tournament) {
      return res.status(404).json({ error: 'Nenhum torneio ativo' });
    }
    const teams = await teamService.getTeams(category, gender, tournament.id);
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    await teamService.deleteTeam(parseInt(id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { player1, player2, clubId } = req.body;
    const team = await teamService.updateTeam(parseInt(id), player1, player2, clubId);
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};