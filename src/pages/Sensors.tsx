import React, { useEffect, useState } from 'react';
import { Activity, Droplets, Thermometer, Gauge,  Waves, Zap, Battery,  TrendingUp,AlertCircle,CheckCircle,AlertTriangle,Info
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

export default function Sensors() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        // Appel API réel
        const response = await api.get('/sensors/');
        setSensors(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Erreur lors du chargement des données');
        console.error('Erreur API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, []);

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

  if (sensors.length === 0) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-lg">
        Aucune donnée de capteur disponible. Vérifiez la base de données.
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Capteurs en temps réel</h1>
          <p className="text-gray-400 text-sm mt-1">Surveillance des données en direct du système AquaSmart</p>
        </div>
        <div className="flex items-center gap-2 bg-[#055DBF]/10 border border-[#055DBF]/30 rounded-lg px-4 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">
            {sensors.length} capteurs actifs
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sensors.map((sensor) => (
          <div
            key={sensor.id}
            className="bg-[#055DBF]/5 border border-[#055DBF]/20 rounded-xl p-5 backdrop-blur-sm hover:border-[#055DBF]/50 transition-all duration-300"
          >
            {/* En-tête */}
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

            {/* Valeur */}
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

            {/* Barre de progression pour level */}
            {sensor.sensor_type === 'level' && (
              <div className="mt-3 w-full h-1.5 bg-[#055DBF]/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#055DBF] to-[#014EAE] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(sensor.value, 100)}%` }}
                ></div>
              </div>
            )}

            {/* Barre de progression pour voltage */}
            {sensor.sensor_type === 'voltage' && (
              <div className="mt-3 w-full h-1.5 bg-[#055DBF]/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((sensor.value / 30) * 100, 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Statistiques */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#055DBF]/5 border border-[#055DBF]/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{sensors.length}</p>
          <p className="text-xs text-gray-400">Capteurs actifs</p>
        </div>
        <div className="bg-[#055DBF]/5 border border-[#055DBF]/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {sensors.filter(s => s.status === 'normal').length}
          </p>
          <p className="text-xs text-gray-400">En état normal</p>
        </div>
        <div className="bg-[#055DBF]/5 border border-[#055DBF]/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {sensors.filter(s => s.status === 'warning').length}
          </p>
          <p className="text-xs text-gray-400">En avertissement</p>
        </div>
        <div className="bg-[#055DBF]/5 border border-[#055DBF]/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {sensors.filter(s => s.status === 'critical').length}
          </p>
          <p className="text-xs text-gray-400">Critiques</p>
        </div>
      </div>
    </div>
  );
}