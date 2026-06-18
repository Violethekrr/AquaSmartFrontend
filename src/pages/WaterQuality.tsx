// ============================================
// WaterQuality.tsx - Qualité de l'eau
// ============================================

import React, { useEffect, useState } from 'react';
import {
  Droplets, Waves, Thermometer, Activity,
  CheckCircle, AlertTriangle, AlertCircle,
  Search, X, Download
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
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

interface ProductionReport {
  id: number;
  report_date: string;
  avg_salinity_out_ppm: number;
  avg_pH: number;
}

const WATER_TYPES = [
  { value: 'all',         label: 'Tous les paramètres' },
  { value: 'salinity',    label: 'Salinité' },
  { value: 'ph',          label: 'pH' },
  { value: 'temperature', label: 'Température' },
  { value: 'flow',        label: 'Débit' },
];

// Couleurs par type de capteur
const SENSOR_ICON: Record<string, React.ReactNode> = {
  salinity:    <Waves    className="w-5 h-5 text-blue-400" />,
  ph:          <Droplets className="w-5 h-5 text-purple-400" />,
  temperature: <Thermometer className="w-5 h-5 text-red-400" />,
  flow:        <Activity className="w-5 h-5 text-cyan-400" />,
  level:       <Activity className="w-5 h-5 text-green-400" />,
};

const SENSOR_LABEL: Record<string, string> = {
  salinity:    'Salinité',
  ph:          'pH',
  temperature: 'Température',
  flow:        'Débit',
  level:       'Niveau',
};

const STATUS_STYLE: Record<string, string> = {
  normal:   'bg-green-500/15 text-green-400 border-green-500/30',
  warning:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'normal')   return <CheckCircle  className="w-3.5 h-3.5" />;
  if (status === 'warning')  return <AlertTriangle className="w-3.5 h-3.5" />;
  return <AlertCircle className="w-3.5 h-3.5" />;
}

export default function WaterQuality() {
  const [sensors, setSensors]               = useState<Sensor[]>([]);
  const [filteredSensors, setFilteredSensors] = useState<Sensor[]>([]);
  const [reports, setReports]               = useState<ProductionReport[]>([]);
  const [loading, setLoading]               = useState(true);
  const [filterType, setFilterType]         = useState('all');
  const [searchQuery, setSearchQuery]       = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorsRes, reportsRes] = await Promise.all([
          api.get('/sensors/'),
          api.get('/production/?ordering=-report_date&limit=7'),
        ]);
      const waterSensors: Sensor[] = sensorsRes.data.filter((s: Sensor) =>
  ['salinity', 'ph', 'temperature', 'flow', 'level', 'turbidity', 'hardness', 'dioxyde'].includes(s.sensor_type)
);
        setSensors(waterSensors);
        setFilteredSensors(waterSensors);
        setReports(reportsRes.data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...sensors];
    if (filterType !== 'all') result = result.filter((s) => s.sensor_type === filterType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.location?.toLowerCase().includes(q) ||
          s.sensor_type?.toLowerCase().includes(q)
      );
    }
    setFilteredSensors(result);
  }, [sensors, filterType, searchQuery]);

  // Calcul de la qualité de l'eau
  const waterQuality = sensors.length > 0 
    ? Math.round((sensors.filter(s => s.status === 'normal').length / sensors.length) * 100)
    : 0;
  
  const waterQualityLabel = waterQuality > 80 ? 'Excellente' : waterQuality > 60 ? 'Moyenne' : 'Critique';
  const waterQualityColor = waterQuality > 80 ? 'text-green-400' : waterQuality > 60 ? 'text-yellow-400' : 'text-red-400';

  // Données du graphique
  const chartData = reports.slice().reverse().map(r => ({
    date: new Date(r.report_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    Salinite: r.avg_salinity_out_ppm || 0,
    pH: r.avg_pH || 7.0,
  }));

// Calcul des paramètres principaux à partir des capteurs
// Calcul des paramètres principaux à partir des capteurs (après chargement)
const mainParams = [
  { key: 'tds', label: 'TDS', unit: 'ppm', value: sensors.find(s => s.sensor_type === 'salinity')?.value || 0, color: 'text-blue-400' },
  { key: 'ph', label: 'pH', unit: '', value: sensors.find(s => s.sensor_type === 'ph')?.value || 0, color: 'text-purple-400' },
  { key: 'turbidity', label: 'Turbidité', unit: 'NTU', value: sensors.find(s => s.sensor_type === 'turbidity')?.value || 0, color: 'text-yellow-400' },
  { key: 'temperature', label: 'Température', unit: '°C', value: sensors.find(s => s.sensor_type === 'temperature')?.value || 0, color: 'text-red-400' },
  { key: 'hardness', label: 'Dureté', unit: '', value: sensors.find(s => s.sensor_type === 'hardness')?.value || 0, color: 'text-green-400' },
  { key: 'dioxyde', label: 'Dioxyde', unit: 'ppm', value: sensors.find(s => s.sensor_type === 'dioxyde')?.value || 0, color: 'text-cyan-400' },
];

  const normalCount = filteredSensors.filter((s) => s.status === 'normal').length;
  const activeFilters = (filterType !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0);

  const DONUT_DATA = [
    { name: 'Qualité', value: waterQuality },
    { name: 'Reste',   value: 100 - waterQuality },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#055DBF]" />
      </div>
    );
  }

  return (
    <div className="">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4 sm:absolute top-0 left-0 sm:m-4">
        <div>
          <h1 className="text-xl font-bold text-white">Qualité de l'eau</h1>
          <p className="text-gray-400 text-sm mt-1">Paramètres et indicateurs de la qualité de l'eau</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-full bg-[#055DBF]/10 border border-[#055DBF]/20 text-gray-400">
            {reports.length} rapports disponibles
          </span>
        </div>
      </div>

      {/* Top : Donut + Paramètres principaux */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-4 mb-4 mt-4">
        {/* Donut qualité */}
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-5 flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 mb-3">
            <PieChart width={112} height={112}>
              <Pie
                data={DONUT_DATA}
                cx={56} cy={56}
                innerRadius={40} outerRadius={54}
                startAngle={90} endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill="#3b82f6" />
                <Cell fill="rgba(5,93,191,0.15)" />
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-extrabold text-blue-400">{waterQuality}%</span>
            </div>
          </div>
          <p className={`text-base font-bold ${waterQualityColor}`}>{waterQualityLabel}</p>
          <p className="text-xs text-gray-400 mt-1 text-center">Eau de {waterQualityLabel.toLowerCase()} qualité</p>
        </div>

        {/* Paramètres principaux */}
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4">
          <h2 className="text-base font-semibold text-white mb-3">Paramètres principaux</h2>
          <div className="grid grid-cols-3 gap-2">
            {mainParams.map((p) => (
              <div key={p.key} className="bg-gray-900/10 border border-[#055DBF]/20 rounded-lg p-2.5 text-center">
                <p className={`text-base lg:text-xl font-bold ${p.color}`}>
                  {typeof p.value === 'number' ? p.value.toFixed(p.key === 'ph' ? 1 : 0) : p.value}
                  {p.unit && <span className="text-xs text-gray-400 ml-1">{p.unit}</span>}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphe évolution */}
      <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4 mb-4">
        <h2 className="text-base font-semibold text-white mb-3">Évolution de la qualité (7 derniers jours)</h2>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
            Aucune donnée de production disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(5,93,191,0.08)" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#0d1528',
                  border: '1px solid rgba(5,93,191,0.3)',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Legend wrapperStyle={{ fontSize: 10, color: '#9ca3af' }} />
              <Line yAxisId="left" type="monotone" dataKey="Salinite" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="pH" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Filtres capteurs */}
      <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-3 mb-4 flex flex-col lg:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par localisation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/10 border border-[#055DBF]/20 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#055DBF]/50"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-900/10 border border-[#055DBF]/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
        >
          {WATER_TYPES.map((t) => (
            <option key={t.value} value={t.value} className="bg-gray-800">
              {t.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-300">
            {normalCount}/{filteredSensors.length} paramètres normaux
          </span>
        </div>
        {activeFilters > 0 && (
          <button
            onClick={() => { setFilterType('all'); setSearchQuery(''); }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#055DBF]/20 rounded-lg transition"
          >
            <X className="w-3.5 h-3.5" /> Réinitialiser ({activeFilters})
          </button>
        )}
      </div>

      {/* Grille capteurs */}
      {filteredSensors.length === 0 ? (
        <div className="bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 p-4 rounded-xl text-center text-sm">
          Aucun paramètre trouvé
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredSensors.map((sensor) => (
            <div
              key={sensor.id}
              className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4 hover:border-[#055DBF]/50 transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#055DBF]/10 rounded-lg">
                    {SENSOR_ICON[sensor.sensor_type] ?? <Activity className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      {SENSOR_LABEL[sensor.sensor_type] ?? sensor.sensor_type}
                    </p>
                    <p className="text-xs text-gray-500">{sensor.location ?? 'N/A'}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[sensor.status] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/30'}`}>
                  <StatusIcon status={sensor.status} />
                  <span className="capitalize">{sensor.status}</span>
                </div>
              </div>

              {/* Valeur */}
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-2xl font-bold text-white">{sensor.value}</span>
                  <span className="text-xs text-gray-400 ml-1">{sensor.unit}</span>
                </div>
                <span className="text-[10px] text-gray-500">
                  {new Date(sensor.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Barre de progression pour le niveau */}
              {sensor.sensor_type === 'level' && (
                <div className="mt-3 h-1.5 bg-[#055DBF]/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#055DBF] to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(sensor.value, 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}