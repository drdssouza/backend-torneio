import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar, Trophy } from 'lucide-react';
import { api } from '../utils/api';
import { useStore } from '../store/useStore';

export default function ManageTournaments() {
  const { isAuthenticated } = useStore();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadTournaments();
    }
  }, [isAuthenticated]);

  const loadTournaments = async () => {
    const data = await api.getAllTournaments();
    setTournaments(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createTournament(formData.name, formData.date);
      setFormData({ name: '', date: '' });
      setShowForm(false);
      loadTournaments();
    } catch (error) {
      alert('Erro ao criar torneio');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Excluir este torneio? Todos os dados serão perdidos!')) {
      try {
        await api.deleteTournament(id);
        loadTournaments();
      } catch (error) {
        alert(error.message || 'Erro ao excluir torneio');
      }
    }
  };

  const handleSetActive = async (id) => {
    try {
      await api.setActiveTournament(id);
      loadTournaments();
    } catch (error) {
      alert('Erro ao ativar torneio');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Acesso restrito ao administrador</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Edições</h1>
              <p className="text-sm text-gray-500 mt-1">
                Criar e gerenciar edições do torneio
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" /> Nova Edição
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {showForm && (
          <div className="border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">Nova Edição do Torneio</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Nome da Edição</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: 1ª Edição Torneio Interclubes"
                  className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Data do Torneio</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
                >
                  Criar Edição
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {tournaments.length === 0 ? (
            <div className="text-center py-20 border border-gray-200 rounded-lg">
              <p className="text-gray-500">Nenhuma edição cadastrada ainda.</p>
            </div>
          ) : (
            tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className={`border rounded-lg p-6 ${
                  tournament.isActive 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{tournament.name}</h3>
                      {tournament.isActive && (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                          ATIVA
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(tournament.date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        {tournament._count.teams} duplas • {tournament._count.matches} jogos
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!tournament.isActive && (
                      <button
                        onClick={() => handleSetActive(tournament.id)}
                        className="text-sm text-green-600 hover:text-green-700 px-3 py-1 border border-green-600 rounded hover:bg-green-50"
                      >
                        Ativar
                      </button>
                    )}
                    
                    {!tournament.isActive && (
                      <button
                        onClick={() => handleDelete(tournament.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}