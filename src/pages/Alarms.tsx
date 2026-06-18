// ============================================
// Alarms.tsx - Gestion des alarmes
// ============================================

import React, { useEffect, useState } from 'react';
import {
  AlertCircle, AlertTriangle, Info,
  Search, X, Clock, CheckCheck
} from 'lucide-react';
import api from '../services/api';

interface Alarm {
  id: number;
  sensor_type: string;
  message: string;
  severity: string;
  value: number;
  threshold: number;
  acknowledged: boolean;
  created_at: string;
}

const SEVERITIES = [
  { value: 'all', label: 'Toutes les sévérités' },
  { value: 'critical', label: 'Critique' },
  { value: 'warning', label: 'Avertissement' },
  { value: 'info', label: 'Information' },
];

const SEV_STYLES: Record<string, string> = {
  critical: 'bg-red-500/[0.07] border-red-500/25',
  warning:  'bg-yellow-500/[0.07] border-yellow-500/25',
  info:     'bg-blue-500/[0.07] border-blue-500/25',
};

const SEV_BADGE: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400',
  warning:  'bg-yellow-500/15 text-yellow-400',
  info:     'bg-blue-500/15 text-blue-400',
};

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === 'critical') return <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
  if (severity === 'warning')  return <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />;
  return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
}

export default function Alarms() {
  const [alarms, setAlarms]               = useState<Alarm[]>([]);
  const [filteredAlarms, setFilteredAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filterSeverity, setFilterSeverity]         = useState('all');
  const [filterAcknowledged, setFilterAcknowledged] = useState('all');
  const [searchQuery, setSearchQuery]     = useState('');

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const res = await api.get('/alarms/');
        setAlarms(res.data);
        setFilteredAlarms(res.data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlarms();
  }, []);

  useEffect(() => {
    let result = [...alarms];
    if (filterSeverity !== 'all')
      result = result.filter((a) => a.severity === filterSeverity);
    if (filterAcknowledged !== 'all')
      result = result.filter((a) => a.acknowledged === (filterAcknowledged === 'acknowledged'));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.message.toLowerCase().includes(q) ||
          a.sensor_type.toLowerCase().includes(q)
      );
    }
    setFilteredAlarms(result);
  }, [alarms, filterSeverity, filterAcknowledged, searchQuery]);

  const acknowledgeAlarm = async (id: number) => {
    try {
      await api.put(`/alarms/${id}/`, { acknowledged: true });
      setAlarms((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const acknowledgeAll = async () => {
    try {
      await Promise.all(
        alarms
          .filter((a) => !a.acknowledged)
          .map((a) => api.put(`/alarms/${a.id}/`, { acknowledged: true }))
      );
      setAlarms((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const unackCount = filteredAlarms.filter((a) => !a.acknowledged).length;
  const activeFilters =
    (filterSeverity !== 'all' ? 1 : 0) +
    (filterAcknowledged !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const resetFilters = () => {
    setFilterSeverity('all');
    setFilterAcknowledged('all');
    setSearchQuery('');
  };

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
          <h1 className="text-xl font-bold text-white">Alarmes</h1>
          <p className="text-gray-400  mt-1">Gestion des alertes du système</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#055DBF]/10 border border-[#055DBF]/30 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className=" text-gray-300">{unackCount} non acquittées</span>
          </div>
          {alarms.some((a) => !a.acknowledged) && (
            <button
              onClick={acknowledgeAll}
              className="flex items-center gap-1.5  bg-[#055DBF]/10 border border-[#055DBF]/20 rounded-lg px-3 py-1.5 text-white hover:bg-[#055DBF]/20 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Marquer tout comme lu
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-3 mb-4 flex flex-col lg:flex-row gap-2 mt-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par message ou type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/10 border border-[#055DBF]/20 rounded-lg pl-8 pr-3 py-1.5  text-white placeholder-gray-400 focus:outline-none focus:border-[#055DBF]/50"
          />
        </div>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="bg-gray-900/10 border border-[#055DBF]/20 rounded-lg px-3 py-1.5  text-white focus:outline-none cursor-pointer"
        >
          {SEVERITIES.map((s) => (
            <option key={s.value} value={s.value} className="bg-gray-800">
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={filterAcknowledged}
          onChange={(e) => setFilterAcknowledged(e.target.value)}
          className="bg-gray-9/10 border border-[#055DBF]/20 rounded-lg px-3 py-1.5  text-white focus:outline-none cursor-pointer"
        >
          <option value="all" className="bg-gray-800">Tous les statuts</option>
          <option value="acknowledged" className="bg-gray-800">Acquittées</option>
          <option value="unacknowledged" className="bg-gray-800">Non acquittées</option>
        </select>
        {activeFilters > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-1.5  text-gray-400 hover:text-white hover:bg-[#055DBF]/20 rounded-lg transition"
          >
            <X className="w-3.5 h-3.5" /> Réinitialiser ({activeFilters})
          </button>
        )}
      </div>

      {/* Compteur */}
      <p className=" text-gray-400 mb-3">
        Affichage de {filteredAlarms.length} alarme{filteredAlarms.length !== 1 ? 's' : ''}
      </p>

      {/* Liste */}
      {filteredAlarms.length === 0 ? (
        <div className="bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 p-4 rounded-xl text-center text-sm">
          Aucune alarme trouvée
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAlarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border ${SEV_STYLES[alarm.severity] ?? 'bg-gray-500/10 border-gray-500/25'}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <SeverityIcon severity={alarm.severity} />
                </div>
                <div>
                  <p className="text-base font-medium text-white">{alarm.message}</p>
                  <div className="flex flex-wrap gap-3 mt-1  text-gray-400">
                    <span>Type: {alarm.sensor_type}</span>
                    {alarm.threshold != null && (
                      <span>Valeur: {alarm.value} (seuil: {alarm.threshold})</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(alarm.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 md:mt-0 shrink-0">
                {/* Badge sévérité */}
                <span className={`px-2 py-0.5 rounded-full  font-medium capitalize ${SEV_BADGE[alarm.severity]}`}>
                  {alarm.severity === 'critical' ? 'Critique' : alarm.severity === 'warning' ? 'Avertissement' : 'Information'}
                </span>

                {!alarm.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlarm(alarm.id)}
                    className="px-3 py-1  bg-[#055DBF] text-white rounded-lg hover:bg-[#014EAE] transition"
                  >
                    Acquitter
                  </button>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full  font-medium ${
                    alarm.acknowledged
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-yellow-500/15 text-yellow-400'
                  }`}
                >
                  {alarm.acknowledged ? 'Acquittée' : 'En attente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}