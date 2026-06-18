import React, { useEffect, useState } from 'react';
import { 
  Activity, Droplets, Thermometer, Gauge, Waves, Zap, Battery, 
  TrendingUp, AlertCircle, CheckCircle, AlertTriangle, Info,
  Filter, X, Search
} from 'lucide-react';
import api from '../services/api';

interface Sensor {
  id: number;
  sensor_type: string;
  value: number;
  unit: string;
  status: string;
  location: string;
  timestamp: string;
}

// Types de capteurs disponibles
const SENSOR_TYPES = [
  { value: 'all', label: 'Tous les types' },
  { value: 'salinity', label: 'Salinité' },
  { value: 'ph', label: 'pH' },
  { value: 'pressure', label: 'Pression' },
  { value: 'temperature', label: 'Température' },
  { value: 'flow', label: 'Débit' },
  { value: 'level', label: 'Niveau' },
  { value: 'voltage', label: 'Tension' },
  { value: 'current', label: 'Courant' },
];

// Statuts disponibles
const STATUSES = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'normal', label: 'Normal' },
  { value: 'warning', label: 'Avertissement' },
  { value: 'critical', label: 'Critique' },
];

export default function Sensors() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [filteredSensors, setFilteredSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États des filtres
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await api.get('/sensors/');
        setSensors(response.data);
        setFilteredSensors(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Erreur lors du chargement des données');
        console.error('Erreur API:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSensors();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let result = [...sensors];

    // Filtre par type
    if (filterType !== 'all') {
      result = result.filter(s => s.sensor_type === filterType);
    }

    // Filtre par statut
    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus);
    }

    // Recherche par localisation
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(s => 
        s.location?.toLowerCase().includes(query) ||
        s.sensor_type?.toLowerCase().includes(query)
      );
    }

    setFilteredSensors(result);
  }, [sensors, filterType, filterStatus, searchQuery]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    setSearchQuery('');
  };

  const getSensorIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      salinity: <Waves className="w-6 h-6 text-blue-400" />,
      ph: <Droplets className="w-6 h-6 text-purple-400" />,
      pressure: <Gauge className="w-6 h-6 text-orange-400" />,
      temperature: <Thermometer className="w-6 h-6 text-red-400" />,
      flow: <Activity className="w-6 h-6 text-cyan-400" />,
      level: <TrendingUp className="w-6 h-6 text-green-400" />,
      voltage: <Zap className="w-6 h-6 text-yellow-400" />,
      current: <Battery className="w-6 h-6 text-indigo-400" />,
    };
    return icons[type] || <Activity className="w-6 h-6 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      normal: 'bg-green-500/20 text-green-400 border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      normal: <CheckCircle className="w-4 h-4" />,
      warning: <AlertTriangle className="w-4 h-4" />,
      critical: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || <Info className="w-4 h-4" />;
  };

  const getSensorLabel = (type: string) => {
    const labels: Record<string, string> = {
      salinity: 'Salinité',
      ph: 'pH',
      pressure: 'Pression',
      temperature: 'Température',
      flow: 'Débit',
      level: 'Niveau',
      voltage: 'Tension',
      current: 'Courant',
    };
    return labels[type] || type;
  };

  // Compter les filtres actifs
  const activeFiltersCount = (filterType !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:absolute top-0 left-0 sm:m-4 ">
        <div>
          <h1 className="text-2xl font-bold text-white">Capteurs en temps réel</h1>
          <p className="text-gray-400 text-sm mt-1">Surveillance des données en direct du système AquaSmart</p>
        </div>
       
      </div>

      {/* Barre de filtres */}
      <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4 mb-6 mt-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par localisation ou type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/10 border border-[#055DBF]/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#055DBF]/50"
            />
          </div>

          {/* Filtre Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-900/10 border border-[#055DBF]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#055DBF]/50"
          >
            {SENSOR_TYPES.map(type => (
              <option key={type.value} value={type.value} className="bg-gray-800">
                {type.label}
              </option>
            ))}
          </select>

          {/* Filtre Statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-900/10 border border-[#055DBF]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#055DBF]/50"
          >
            {STATUSES.map(status => (
              <option key={status.value} value={status.value} className="bg-gray-800">
                {status.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 bg-gray-900/10 border border-[#055DBF]/30 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">
              {filteredSensors.length} / {sensors.length} capteurs actifs
            </span>
          </div>

          {/* Bouton Reset */}
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#055DBF]/20 rounded-lg transition"
            >
              <X size={16} />
              Réinitialiser ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* Filtres actifs (tags) */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#055DBF]/20">
            {filterType !== 'all' && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#055DBF]/20 text-xs text-blue-300 rounded-full">
                Type: {SENSOR_TYPES.find(t => t.value === filterType)?.label}
                <button onClick={() => setFilterType('all')} className="hover:text-white">×</button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#055DBF]/20 text-xs text-blue-300 rounded-full">
                Statut: {STATUSES.find(s => s.value === filterStatus)?.label}
                <button onClick={() => setFilterStatus('all')} className="hover:text-white">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#055DBF]/20 text-xs text-blue-300 rounded-full">
                Recherche: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-white">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Message si aucun résultat */}
      {filteredSensors.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-lg text-center mb-6">
          Aucun capteur ne correspond à vos filtres. Essayez de modifier votre recherche.
        </div>
      )}

      {/* Grille des capteurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSensors.map((sensor) => (
          <div
            key={sensor.id}
            className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-5  hover:border-[#055DBF]/40 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#055DBF]/10 rounded-lg">
                  {getSensorIcon(sensor.sensor_type)}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-200">
                    {getSensorLabel(sensor.sensor_type)}
                  </h3>
                  <p className="text-xs text-gray-500">{sensor.location || 'N/A'}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(sensor.status)} border`}>
                {getStatusIcon(sensor.status)}
                <span className="capitalize">{sensor.status}</span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold text-white">
                  {sensor.value}
                </span>
                <span className="text-sm text-gray-400 ml-1">{sensor.unit}</span>
              </div>
              <div className="text-xs text-gray-500">
                {sensor.timestamp ? new Date(sensor.timestamp).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '--:--'}
              </div>
            </div>

            {sensor.sensor_type === 'level' && (
              <div className="mt-3 w-full h-1.5 bg-[#055DBF]/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#055DBF] to-[#014EAE] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(sensor.value, 100)}%` }}
                />
              </div>
            )}

            {sensor.sensor_type === 'voltage' && (
              <div className="mt-3 w-full h-1.5 bg-[#055DBF]/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((sensor.value / 30) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Statistiques */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{filteredSensors.length}</p>
          <p className="text-xs text-gray-400">Capteurs affichés</p>
        </div>
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {filteredSensors.filter(s => s.status === 'normal').length}
          </p>
          <p className="text-xs text-gray-400">En état normal</p>
        </div>
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {filteredSensors.filter(s => s.status === 'warning').length}
          </p>
          <p className="text-xs text-gray-400">En avertissement</p>
        </div>
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {filteredSensors.filter(s => s.status === 'critical').length}
          </p>
          <p className="text-xs text-gray-400">Critiques</p>
        </div>
      </div>
    </div>
  );
}