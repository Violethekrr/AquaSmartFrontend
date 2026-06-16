import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2">Page non trouvée</p>
      <Link to="/" className="text-blue-500 underline mt-4 inline-block">Retour à l’accueil</Link>
    </div>
  );
}