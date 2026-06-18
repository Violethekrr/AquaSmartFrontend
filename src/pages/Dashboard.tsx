import React, { useEffect, useState } from 'react';
import {
  AlertCircle, AlertTriangle, Info,
  Droplets, Gauge, TrendingUp, CheckCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
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

interface Alarm {
  id: number;
  message: string;
  severity: string;
  acknowledged: boolean;
  created_at: string;
}

interface ProductionReport {
  id: number;
  report_date: string;
  water_produced_liters: number;
  avg_salinity_out_ppm: number;
  avg_pH: number;
  salt_collected_kg: number;
}

export default function Dashboard() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [reports, setReports] = useState<ProductionReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorsRes, alarmsRes, reportsRes] = await Promise.all([
          api.get('/sensors/'),
          api.get('/alarms/'),
          api.get('/production/?ordering=-report_date&limit=7'),
        ]);
        setSensors(sensorsRes.data);
        setAlarms(alarmsRes.data);
        setReports(reportsRes.data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calcul de la qualité de l'eau (moyenne des capteurs normaux)
  const waterQuality = sensors.length > 0 
    ? Math.round((sensors.filter(s => s.status === 'normal').length / sensors.length) * 100)
    : 98;

  // Données du graphique à partir des rapports de production
  const chartData = reports.slice().reverse().map(r => ({
    date: new Date(r.report_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    Production: r.water_produced_liters / 1000,
    Salinite: r.avg_salinity_out_ppm || 0,
    pH: r.avg_pH || 7.0,
  }));

  const pressure = sensors.find((s) => s.sensor_type === 'pressure');
  const flow = sensors.find((s) => s.sensor_type === 'flow');
  const saltLevel = sensors.find((s) => s.sensor_type === 'level');
  const unacknowledgedAlarms = alarms.filter((a) => !a.acknowledged).length;

  // Calcul de la consommation totale du jour (dernier rapport)
  const todayReport = reports.length > 0 ? reports[0] : null;
  const todayConsumption = todayReport?.water_produced_liters || 0;

  // Prochaine maintenance (la plus proche)
  const [nextMaintenance, setNextMaintenance] = useState<{component: string, date: string} | null>(null);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await api.get('/maintenance/?status=scheduled&ordering=next_due&limit=1');
        if (res.data.length > 0) {
          setNextMaintenance({
            component: res.data[0].component,
            date: new Date(res.data[0].next_due).toLocaleDateString('fr-FR')
          });
        }
      } catch (err) {
        console.error('Erreur:', err);
      }
    };
    fetchMaintenance();
  }, []);

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
      <div className="flex flex-col sm:flex-row md:items-center justify-between mb-5 gap-4 sm:absolute top-0 left-0 sm:m-4">
        <div>
          <h1 className="text-xl font-bold text-white">Tableau de bord</h1>
          <p className="text-gray-400 text-xs mt-1">Vue d'ensemble du système AquaSmart</p>
        </div>
        <div className="flex items-center gap-2 bg-[#055DBF]/10 border border-[#055DBF]/30 rounded-lg px-4 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className=" text-gray-300">Système opérationnel</span>
        </div>
      </div>

      {/* 4 cartes KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 mt-4">
        {/* Qualité */}
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className=" text-gray-400">Qualité de l'eau</p>
              <p className="text-2xl font-bold text-white">{waterQuality}%</p>
              <span className={`text-xs ${waterQuality > 80 ? 'text-green-400' : waterQuality > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {waterQuality > 80 ? 'Excellente' : waterQuality > 60 ? 'Moyenne' : 'Critique'}
              </span>
            </div>
            <div className="p-2 bg-[#055DBF]/10 rounded-lg">
              <Droplets className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Pression */}
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className=" text-gray-400">Pression</p>
              <p className="text-2xl font-bold text-white">
                {pressure?.value ?? '--'}{' '}
                <span className="text-sm text-gray-400">{pressure?.unit || 'bar'}</span>
              </p>
              <span className={`text-xs ${pressure?.status === 'normal' ? 'text-green-400' : pressure?.status === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>
                {pressure?.status || 'Inconnu'}
              </span>
            </div>
            <div className="p-2 bg-[#055DBF]/10 rounded-lg">
              <Gauge className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Consommation */}
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className=" text-gray-400">Production du jour</p>
              <p className="text-2xl font-bold text-white">
                {(todayConsumption / 1000).toFixed(1)}{' '}
                <span className="text-sm text-gray-400">m³</span>
              </p>
              <span className="text-xs text-yellow-400">Aujourd'hui</span>
            </div>
            <div className="p-2 bg-[#055DBF]/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        {/* Alarmes */}
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className=" text-gray-400">Alarmes actives</p>
              <p className="text-2xl font-bold text-red-400">{unacknowledgedAlarms}</p>
              <span className="text-xs text-red-400">Non acquittées</span>
            </div>
            <div className="p-2 bg-[#055DBF]/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphe + Alarmes récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Graphe capteurs */}
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Production des 7 derniers jours</h2>
            <span className=" text-gray-400">Derniers rapports</span>
          </div>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
              Aucune donnée de production disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(5,93,191,0.08)" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0d1528', border: '1px solid rgba(5,93,191,0.3)', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Legend wrapperStyle={{ fontSize: 10, color: '#9ca3af' }} />
                <Line yAxisId="left" type="monotone" dataKey="Production" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="Salinite" stroke="#06b6d4" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
                <Line yAxisId="right" type="monotone" dataKey="pH" stroke="#f97316" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="2 3" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Alarmes récentes */}
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Alarmes récentes</h2>
            <Link to='/alarms' className="text-xs text-blue-400 cursor-pointer hover:underline">
              Voir tout
            </Link>
          </div>
          {alarms.length === 0 ? (
            <p className="text-gray-400 ">Aucune alarme récente</p>
          ) : (
            <div className="space-y-2">
              {alarms.slice(0, 3).map((alarm) => (
                <div
                  key={alarm.id}
                  className={`flex items-center justify-between p-3 rounded-lg border  ${
                    alarm.severity === 'critical'
                      ? 'bg-red-500/10 border-red-500/25'
                      : alarm.severity === 'warning'
                      ? 'bg-yellow-500/10 border-yellow-500/25'
                      : 'bg-blue-500/10 border-blue-500/25'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {alarm.severity === 'critical' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    {alarm.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />}
                    {alarm.severity === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
                    <span className="text-white text-sm">{alarm.message}</span>
                  </div>
                  <span className="text-gray-400 shrink-0 ml-3 text-xs">
                    {new Date(alarm.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-3">
            <Link to='/alarms' className="text-xs text-blue-400 cursor-pointer hover:underline">
              Voir toutes les alarmes →
            </Link>
          </div>
        </div>
      </div>

      {/* Ligne bas : Système / Maintenance / Sel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4">
          <p className=" text-gray-400 mb-2">État du système</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-white">En ligne</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {sensors.length} capteurs actifs / {alarms.filter(a => !a.acknowledged).length} alarmes
          </p>
        </div>

        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4">
          <p className=" text-gray-400 mb-2">Prochaine maintenance</p>
          {nextMaintenance ? (
            <>
              <p className="text-base font-bold text-white">{nextMaintenance.date}</p>
              <p className="text-xs text-gray-400 mt-1">{nextMaintenance.component}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Aucune maintenance planifiée</p>
          )}
        </div>

        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4">
          <p className=" text-gray-400 mb-2">Niveau de sel</p>
          <p className="text-2xl font-bold text-white">
            {saltLevel?.value ?? '--'}
            <span className="text-sm text-gray-400 ml-1">{saltLevel?.unit || '%'}</span>
          </p>
          <div className="mt-2 h-1.5 bg-[#055DBF]/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#055DBF] to-blue-400 rounded-full transition-all"
              style={{ width: `${Math.min(saltLevel?.value || 0, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}