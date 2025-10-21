import { useStore } from '../store/useStore';
import { Info } from 'lucide-react';

export default function GroupStandings() {
  const { groups } = useStore();

  if (groups.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Nenhum grupo gerado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Critérios de Desempate */}
      <div className="border border-blue-100 bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-2">Critérios de Classificação</p>
            <ol className="text-xs text-blue-800 space-y-1">
              <li>1º - Maior número de vitórias</li>
              <li>2º - Maior saldo de games (GW - GL)</li>
              <li>3º - Maior número de games vencidos</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {groups.map((group) => (
          <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Grupo {group.name}</h3>
            </div>

            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Dupla</th>
                    <th className="pb-3 font-medium text-center">V</th>
                    <th className="pb-3 font-medium text-center">GW</th>
                    <th className="pb-3 font-medium text-center">GL</th>
                    <th className="pb-3 font-medium text-center">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {group.teams.map((team, i) => (
                    <tr
                      key={team.id}
                      className={`border-b border-gray-50 ${
                        i < 2 ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="py-3 text-sm text-gray-900 font-medium">
                        {i + 1}
                        {i < 2 && <span className="ml-1 text-green-600">✓</span>}
                      </td>
                      <td className="py-3">
                        <div className="text-sm text-gray-900 font-medium">
                          {team.player1} / {team.player2}
                        </div>
                        <div className="text-xs text-gray-500">{team.club.name}</div>
                      </td>
                      <td className="py-3 text-sm text-gray-900 text-center font-semibold">{team.wins}</td>
                      <td className="py-3 text-sm text-gray-900 text-center">{team.gamesWon}</td>
                      <td className="py-3 text-sm text-gray-900 text-center">{team.gamesLost}</td>
                      <td className="py-3 text-sm text-gray-900 text-center font-medium">
                        {team.gamesWon - team.gamesLost > 0 ? '+' : ''}
                        {team.gamesWon - team.gamesLost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-500">
          <span className="font-medium">Legenda:</span> V = Vitórias • GW = Games Vencidos • GL = Games Lost (Perdidos) • 
          <span className="text-green-600 ml-2">✓ Classificados para as eliminatórias</span>
        </p>
      </div>
    </div>
  );
}