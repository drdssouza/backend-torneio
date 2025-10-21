import { LogOut, LogIn, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function Home({ onSelectCategory, onManageTeams, onShowLogin, onShowRanking }) {
  const { isAuthenticated, username, logout } = useStore();
  const categories = ['E', 'D', 'C'];
  const genders = ['MASCULINO', 'FEMININO'];

  return (
    <div className="min-h-screen bg-white">
      {/* Header simples */}
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Torneio Interclubes</h1>
            <p className="text-sm text-gray-500 mt-1">Beach Tennis • 2025</p>
          </div>

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          ) : (
            <button
              onClick={onShowLogin}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Admin
            </button>
          )}
        </div>
      </header>

      {/* Clubes */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center gap-8 pb-12 border-b border-gray-100">
          {[
            { name: 'Arena B2', logo: '/logos/arena-b2.png' },
            { name: 'Rilex Beach', logo: '/logos/rilex.png' },
            { name: 'Beach do Lago', logo: '/logos/beach-lago.png' },
            { name: 'Arena Beach MN', logo: '/logos/arena-mn.png' }
          ].map((club) => (
            <div key={club.name} className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
                <img 
                  src={club.logo} 
                  alt={club.name}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="text-xl text-gray-400">${club.name[0]}</span>`;
                  }}
                />
              </div>
              <p className="text-xs text-gray-600">{club.name}</p>
            </div>
          ))}
        </div>

        {/* Botão Ranking */}
        <div className="py-8 text-center">
          <button
            onClick={onShowRanking}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
          >
            <Award className="w-5 h-5" />
            Classificação Geral das Arenas
          </button>
        </div>

        {/* Categorias */}
        <div className="mt-12 space-y-12">
          {categories.map((cat) => (
            <div key={cat}>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Categoria {cat}</h2>
              
              <div className="grid grid-cols-2 gap-6">
                {genders.map((gender) => (
                  <div key={gender} className="border border-gray-200 rounded-lg p-6">
                    <p className="text-sm font-medium text-gray-500 mb-4">{gender}</p>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => onSelectCategory(cat, gender)}
                        className="w-full bg-gray-900 text-white px-4 py-3 rounded text-sm font-medium hover:bg-gray-800 transition"
                      >
                        Ver Torneio
                      </button>
                      
                      {isAuthenticated && (
                        <button
                          onClick={() => onManageTeams(cat, gender)}
                          className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded text-sm font-medium hover:bg-gray-50 transition"
                        >
                          Gerenciar Duplas
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <p className="text-xs text-gray-500">Rolê Connection Play • 2025</p>
        </div>
      </footer>
    </div>
  );
}