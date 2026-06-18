import React, { useEffect, useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, Droplets, Zap, Beaker } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

interface ProductionReport {
  id: number;
  report_date: string;
  water_produced_liters: number;
  water_distributed_liters: number;
  energy_used_kwh: number;
  energy_produced_kwh: number;
  avg_salinity_out_ppm: number;
  salt_collected_kg: number;
  total_revenue_fcfa: number;
  total_expenses_fcfa: number;
}

export default function Reports() {
  const [reports, setReports] = useState<ProductionReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/production/?ordering=-report_date&limit=30');
        setReports(res.data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Calcul des totaux
  const totalWater = reports.reduce((sum, r) => sum + r.water_produced_liters, 0);
  const totalEnergy = reports.reduce((sum, r) => sum + r.energy_used_kwh, 0);
  const totalSalt = reports.reduce((sum, r) => sum + r.salt_collected_kg, 0);
  const totalRevenue = reports.reduce((sum, r) => sum + r.total_revenue_fcfa, 0);

  // Données pour le graphique (7 derniers jours)
  const chartData = reports.slice(0, 7).reverse().map(r => ({
    date: new Date(r.report_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    eau: Math.round(r.water_produced_liters / 1000),
    energie: r.energy_used_kwh,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#055DBF]" />
      </div>
    );
  }

  return (
    <div className="">
        <div className="flex flex-col sm:absolute top-0 left-0 sm:m-4">
          <h1 className="text-2xl font-bold mb-2 text-white">Rapports de production</h1>
           <p className="text-gray-400 text-sm mb-6">Génération de rapports PDF/CSV</p>
      </div>
  
    </div>
  );
}