import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { api } from '../utils/api';

export default function ManageTeams({ category, gender, onBack }) {
  const [teams, setTeams] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    player1: '',
    player2: '',
    clubId: ''
  });

  useEffect(() => {
    loadData();
  }, [category, gender]);

  const loadData = async () => {
    const [teamsData, clubsData] = await Promise.all([
      api.getTeams(category, gender),
      api.getClubs()
    ]);
    setTeams(teamsData);
    setClubs(clubsData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createTeam(
        formData.player1,
        formData.player2,
        parseInt(formData.clubId),
        category,
        gender
      );
      setFormData({ player1: '', player2: '', clubId: '' });
      setShowForm(false);
      loadData();
    } catch (error) {
      alert('Erro ao criar dupla');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Excluir esta dupla?')) {
      await api.deleteTeam(id);
      loadData();
    }
  };

  const teamsByClub = teams.reduce((acc, team) => {
    if (!acc[team.club.name]) acc[team.club.name] = [];
    acc[team.club.name].push(team);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Duplas</h1>
              <p className="text-sm text-gray-500 mt-1">
                Categoria {category} • {gender}
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition"
            >
              <Plus className="w-4 h-4" /> Nova Dupla
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {showForm && (
          <div className="border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Adicionar Dupla</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Jogador 1"
                value={formData.player1}
                onChange={(e) => setFormData({ ...formData, player1: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                required
              />
              <input
                type="text"
                placeholder="Jogador 2"
                value={formData.player2}
                onChange={(e) => setFormData({ ...formData, player2: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                required
              />
              <select
                value={formData.clubId}
                onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                required
              >
                <option value="">Selecione o clube</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-gray-900 text-white px-6 py-2 rounded text-sm hover:bg-gray-800 transition"
              >
                Adicionar
              </button>
            </form>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {teams.length}/16 duplas cadastradas
          </p>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-20 border border-gray-200 rounded-lg">
            <p className="text-gray-500">Nenhuma dupla cadastrada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(teamsByClub).map(([clubName, clubTeams]) => (
              <div key={clubName} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">{clubName}</h3>
                </div>
                <div className="p-6 space-y-2">
                  {clubTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between py-2"
                    >
                      <p className="text-sm text-gray-900">
                        {team.player1} / {team.player2}
                      </p>
                      <button
                        onClick={() => handleDelete(team.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {teams.length === 16 && (
          <div className="mt-8 border border-green-200 bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-800">
              ✓ Todas as 16 duplas cadastradas! Você pode gerar os grupos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}