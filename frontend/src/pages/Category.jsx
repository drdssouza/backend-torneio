import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../utils/api';
import GroupStandings from '../components/GroupStandings';
import MatchList from '../components/MatchList';
import EliminationBracket from '../components/EliminationBracket';

export default function Category({ onBack }) {
  const { category, gender, activeTab, isAuthenticated, setActiveTab, setGroups, setMatches, setElimination } = useStore();

  useEffect(() => {
    loadData();
  }, [category, gender]);

  const loadData = async () => {
    try {
      const [groups, matches, elimination] = await Promise.all([
        api.getGroups(category, gender),
        api.getMatches(category, gender),
        api.getElimination(category, gender)
      ]);
      setGroups(groups);
      setMatches(matches);
      setElimination(elimination);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleGenerateElimination = async () => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado como admin!');
      return;
    }
    try {
      await api.generateElimination(category, gender);
      loadData();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>

          <div>
            <p className="text-sm text-gray-500">Categoria {category}</p>
            <h1 className="text-2xl font-bold text-gray-900">{gender}</h1>
          </div>

          <div className="flex gap-8 mt-6">
            {['grupos', 'jogos', 'eliminatorias'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm pb-2 border-b-2 transition ${
                  activeTab === tab
                    ? 'border-gray-900 text-gray-900 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'grupos' && 'Grupos'}
                {tab === 'jogos' && 'Jogos'}
                {tab === 'eliminatorias' && 'Eliminatórias'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {activeTab === 'grupos' && <GroupStandings />}
        {activeTab === 'jogos' && <MatchList onUpdate={loadData} />}
        {activeTab === 'eliminatorias' && (
          <>
            {isAuthenticated && (
              <button
                onClick={handleGenerateElimination}
                className="mb-8 bg-gray-900 text-white px-6 py-3 rounded text-sm font-medium hover:bg-gray-800 transition"
              >
                Gerar Eliminatórias
              </button>
            )}
            <EliminationBracket onUpdate={loadData} />
          </>
        )}
      </div>
    </div>
  );
}