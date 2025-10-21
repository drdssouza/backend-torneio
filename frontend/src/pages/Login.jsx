import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../utils/api';
import { useStore } from '../store/useStore';

export default function Login({ onLogin, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await api.login(username, password);
      if (result.success) {
        login(result.username);
        onLogin();
      } else {
        setError('Credenciais inválidas');
      }
    } catch (err) {
      setError('Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <button
          onClick={onClose}
          className="mb-8 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Login Admin</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-gray-900"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-3 rounded font-medium hover:bg-gray-800 transition"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-500 text-center">
          Padrão: admin / admin123
        </p>
      </div>
    </div>
  );
}