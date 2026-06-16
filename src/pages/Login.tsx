import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authSlice';
import { login } from '../services/authService';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access_token } = await login(email, password);
      // Pour simplifier, on stocke un user fictif, mais backend devrait retourner user
      setAuth(access_token, { email });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Échec de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-3xl top-[100px] left-[-100px]">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">AquaSmart</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <Alert type="error" message={error} />}
          <Button type="submit" isLoading={loading} className="w-full mt-2">
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}