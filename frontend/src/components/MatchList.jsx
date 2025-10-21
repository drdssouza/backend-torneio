import { useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../utils/api';
import { Edit2 } from 'lucide-react';

export default function MatchList({ onUpdate }) {
  const { matches, groups, isAuthenticated } = useStore();
  const [localScores, setLocalScores] = useState({});
  const [editingMatches, setEditingMatches] = useState(new Set());

  const groupMatches = matches.filter(m => m.phase === 'grupos');

  if (groups.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Nenhum jogo ainda. Gere os grupos primeiro.</p>
      </div>
    );
  }

  const handleScoreChange = (matchId, field, value) => {
    setLocalScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value
      }
    }));
  };

  const handleSave = async (matchId) => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado como admin!');
      return;
    }

    const scores = localScores[matchId];
    if (!scores || scores.score1 === '' || scores.score2 === '' || 
        scores.score1 === undefined || scores.score2 === undefined) {
      alert('Preencha ambos os placares');
      return;
    }

    try {
      await api.updateMatch(matchId, parseInt(scores.score1), parseInt(scores.score2));
      
      setEditingMatches(prev => {
        const newSet = new Set(prev);
        newSet.delete(matchId);
        return newSet;
      });

      setLocalScores(prev => {
        const newScores = { ...prev };
        delete newScores[matchId];
        return newScores;
      });

      onUpdate();
      
      // Recalcular pontos automaticamente
      try {
        await api.calculateRanking();
      } catch (err) {
        console.log('Erro ao calcular ranking:', err);
      }
    } catch (error) {
      alert('Erro ao salvar placar');
    }
  };

  const startEditing = (match) => {
    setEditingMatches(prev => new Set(prev).add(match.id));
    setLocalScores(prev => ({
      ...prev,
      [match.id]: {
        score1: match.score1?.toString() || '',
        score2: match.score2?.toString() || ''
      }
    }));
  };

  const cancelEditing = (matchId) => {
    setEditingMatches(prev => {
      const newSet = new Set(prev);
      newSet.delete(matchId);
      return newSet;
    });
    setLocalScores(prev => {
      const newScores = { ...prev };
      delete newScores[matchId];
      return newScores;
    });
  };

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const groupMatchList = groupMatches.filter(m => m.groupId === group.id);

        return (
          <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Grupo {group.name}</h3>
            </div>

            <div className="p-6 space-y-4">
              {groupMatchList.map((match) => {
                const isEditing = editingMatches.has(match.id);
                const isFinalized = match.status === 'finalizado' && !isEditing;
                const currentScores = localScores[match.id] || {};

                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {match.team1.player1} / {match.team1.player2}
                      </p>
                      <p className="text-xs text-gray-500">{match.team1.club.name}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {isFinalized ? (
                        <>
                          <div className="text-lg font-semibold text-gray-900">
                            {match.score1} - {match.score2}
                          </div>
                          {isAuthenticated && (
                            <button
                              onClick={() => startEditing(match)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Editar placar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            disabled={!isAuthenticated}
                            value={currentScores.score1 || ''}
                            className="w-14 px-2 py-2 border border-gray-300 rounded text-center text-sm focus:outline-none focus:border-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                            onChange={(e) => handleScoreChange(match.id, 'score1', e.target.value)}
                          />
                          <span className="text-gray-400">×</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            disabled={!isAuthenticated}
                            value={currentScores.score2 || ''}
                            className="w-14 px-2 py-2 border border-gray-300 rounded text-center text-sm focus:outline-none focus:border-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                            onChange={(e) => handleScoreChange(match.id, 'score2', e.target.value)}
                          />
                          {isAuthenticated && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSave(match.id)}
                                className="px-4 py-2 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 transition"
                              >
                                Salvar
                              </button>
                              {isEditing && (
                                <button
                                  onClick={() => cancelEditing(match.id)}
                                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition"
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {match.team2.player1} / {match.team2.player2}
                      </p>
                      <p className="text-xs text-gray-500">{match.team2.club.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}