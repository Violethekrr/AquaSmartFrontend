import React, { useEffect, useState } from 'react';
import { Wrench, Calendar, Clock, CheckCircle, AlertCircle, Filter, Search, X } from 'lucide-react';
import api from '../services/api';

interface MaintenanceLog {
  id: number;
  component: string;
  action: string;
  description: string;
  technician_name: string;
  cost: number;
  next_due: string;
  status: string;
  created_at: string;
}

const COMPONENT_LABELS: Record<string, string> = {
  filter: 'Filtre',
  membrane: 'Membrane',
  pump: 'Pompe',
  uv: 'UV',
  sensor: 'Capteur',
  valve: 'Vanne',
  solar_panel: 'Panneau solaire',
  battery: 'Batterie',
};

const ACTION_LABELS: Record<string, string> = {
  replaced: 'Remplacé',
  cleaned: 'Nettoyé',
  inspected: 'Inspecté',
  repaired: 'Réparé',
  calibrated: 'Calibré',
  installed: 'Installé',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  in_progress: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function Maintenance() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterComponent, setFilterComponent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/maintenance/');
        setLogs(res.data);
        setFilteredLogs(res.data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    let result = [...logs];
    if (filterStatus !== 'all') {
      result = result.filter(l => l.status === filterStatus);
    }
    if (filterComponent !== 'all') {
      result = result.filter(l => l.component === filterComponent);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(l => 
        l.technician_name.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
      );
    }
    setFilteredLogs(result);
  }, [logs, filterStatus, filterComponent, searchQuery]);

  const uniqueComponents = [...new Set(logs.map(l => l.component))];

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
         <h1 className="text-2xl font-bold mb-2 text-white">Maintenance préventive</h1>
         <p className="text-gray-400 text-sm mb-6">Suivi des filtres, membrane, pompes</p>
      </div>
 
    </div>
  );
}