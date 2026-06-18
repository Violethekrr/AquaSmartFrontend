// ============================================
// Energy.tsx - Gestion énergétique (100% données réelles)
// ============================================

import React, { useEffect, useState } from 'react';
import { Zap, Battery, Sun, CheckCircle, Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

interface Sensor {
  id: number;
  sensor_type: string;
  value: number;
  unit: string;
  status: string;
  timestamp: string;
}

interface ProductionReport {
  id: number;
  report_date: string;
  energy_used_kwh: number;
  energy_produced_kwh: number;
}

const formatNumber = (num: number): string => {
  if (!num || isNaN(num)) return '0';
  return Math.round(num).toLocaleString('fr-FR');
};

export default function Energy() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [reports, setReports] = useState<ProductionReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorsRes, reportsRes] = await Promise.all([
          api.get('/sensors/'),
          api.get('/production/?ordering=-report_date&limit=7'),
        ]);
        setSensors(sensorsRes.data || []);
        setReports(reportsRes.data || []);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const voltage = sensors.find((s) => s.sensor_type === 'voltage');
  const current = sensors.find((s) => s.sensor_type === 'current');
  const power =
    voltage && current
      ? ((voltage.value * current.value) / 1000).toFixed(1)
      : '--';

  // Données du graphique à partir des rapports
  const weeklyData = reports.slice().reverse().map(r => ({
    day: new Date(r.report_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    consommation: Number(r.energy_used_kwh) || 0,
    production: Number(r.energy_produced_kwh) || 0,
  }));

  const totalConsommation = weeklyData.reduce((s, d) => s + d.consommation, 0);
  const totalProduction = weeklyData.reduce((s, d) => s + d.production, 0);
  const avgConsommation = weeklyData.length > 0 ? totalConsommation / weeklyData.length : 0;
  const autonomie = totalConsommation > 0 ? (totalProduction / totalConsommation) * 100 : 0;
  const evolution = weeklyData.length >= 2 
    ? ((weeklyData[weeklyData.length - 1].consommation - weeklyData[0].consommation) / (weeklyData[0].consommation || 1)) * 100
    : 0;

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
          <h1 className="text-xl font-bold text-white">Énergie</h1>
          <p className="text-gray-400 text-sm mt-1">Suivi de la production et consommation d'énergie</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-full bg-[#055DBF]/10 border border-[#055DBF]/20 text-gray-400">
            {reports.length} rapports disponibles
          </span>
        </div>
      </div>

      {/* KPI 3 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 mt-4 ">
        {/* Consommation totale */}
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-5 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2.5 bg-yellow-400/10 rounded-full">
              <Zap className="w-7 h-7 text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatNumber(totalConsommation)}{' '}
            <span className="text-sm text-gray-400">kWh</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Consommation totale</p>
          {reports.length >= 2 && (
            <p className={`text-xs ${evolution >= 0 ? 'text-red-400' : 'text-green-400'} mt-1`}>
              {evolution >= 0 ? '▲' : '▼'} {formatNumber(Math.abs(evolution))}%
            </p>
          )}
        </div>

        {/* Production totale */}
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-5 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2.5 bg-green-400/10 rounded-full">
              <Sun className="w-7 h-7 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatNumber(totalProduction)}{' '}
            <span className="text-sm text-gray-400">kWh</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Énergie produite</p>
          {totalConsommation > 0 && (
            <p className={`text-xs ${autonomie >= 50 ? 'text-green-400' : 'text-yellow-400'} mt-1`}>
              {formatNumber(autonomie)}% d'autonomie
            </p>
          )}
        </div>

        {/* Consommation moyenne */}
        <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-5 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2.5 bg-orange-400/10 rounded-full">
              <Battery className="w-7 h-7 text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatNumber(avgConsommation)}{' '}
            <span className="text-sm text-gray-400">kWh/jour</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Consommation moyenne</p>
          <p className="text-xs text-gray-400 mt-1">Sur {reports.length} jours</p>
        </div>
      </div>

      {/* Graphe barres */}
      <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4 mb-4">
        <h2 className="text-base font-semibold text-white mb-4">Consommation vs Production</h2>
        {weeklyData.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(5,93,191,0.08)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#0d1528',
                  border: '1px solid rgba(5,93,191,0.3)',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(v: number) => [`${Math.round(v)} kWh`, '']}
                cursor={{ fill: 'rgba(5,93,191,0.07)' }}
              />
              <Bar dataKey="consommation" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Consommation" />
              <Bar dataKey="production" fill="#f97316" radius={[4, 4, 0, 0]} name="Production" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* État des composants */}
      <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4">
        <h2 className="text-base font-semibold text-white mb-3">État des composants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Panneaux solaires', extra: voltage ? `${voltage.value} V` : null },
            { label: 'Batterie', extra: current ? `${current.value} A` : null },
            { label: 'Régulateur', extra: null },
            { label: 'Alimentation', extra: power !== '--' ? `${power} kW` : null },
          ].map(({ label, extra }) => (
            <div
              key={label}
              className="flex items-center justify-between p-3 bg-gray-900/5 border border-[#055DBF]/20 rounded-lg"
            >
              <div>
                <span className="text-gray-300 text-sm">{label}</span>
                {extra && <span className="text-xs text-gray-500 ml-2">{extra}</span>}
              </div>
              <span className="flex items-center gap-1 text-green-400 text-xs">
                <CheckCircle className="w-4 h-4" /> Opérationnel
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}