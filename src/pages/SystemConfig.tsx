// ============================================
// SystemConfig.tsx - Configuration système
// ============================================

import React, { useEffect, useState } from 'react';
import { 
  Settings, Save, RotateCcw, Edit, Check, X,
  Search, Filter, Plus, Trash2, AlertCircle
} from 'lucide-react';
import api from '../services/api';

interface ConfigItem {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
  is_editable: boolean;
}

const CATEGORIES = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'thresholds', label: 'Seuils' },
  { value: 'general', label: 'Général' },
  { value: 'business', label: 'Commercial' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'system', label: 'Système' },
];

export default function SystemConfig() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    let result = [...configs];
    if (filterCategory !== 'all') {
      result = result.filter(c => c.category === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.key.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.value.toLowerCase().includes(q)
      );
    }
    setFilteredConfigs(result);
  }, [configs, filterCategory, searchQuery]);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/config/');
      setConfigs(res.data);
      setFilteredConfigs(res.data);
    } catch (err) {
      console.error('Erreur:', err);
      setMessage({ type: 'error', text: 'Erreur lors du chargement de la configuration' });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (config: ConfigItem) => {
    if (!config.is_editable) return;
    setEditingId(config.id);
    setEditValue(config.value);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveConfig = async (id: number) => {
    setSaving(true);
    try {
      await api.put(`/config/${id}/`, { value: editValue });
      setConfigs(configs.map(c => 
        c.id === id ? { ...c, value: editValue } : c
      ));
      setEditingId(null);
      setEditValue('');
      setMessage({ type: 'success', text: 'Configuration mise à jour avec succès !' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      thresholds: 'Seuils',
      general: 'Général',
      business: 'Commercial',
      maintenance: 'Maintenance',
      system: 'Système',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      thresholds: 'bg-red-500/15 text-red-400 border-red-500/30',
      general: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      business: 'bg-green-500/15 text-green-400 border-green-500/30',
      maintenance: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      system: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    };
    return colors[category] || 'bg-gray-500/15 text-gray-400 border-gray-500/30';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4  sm:absolute top-0 left-0 sm:m-4 ">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuration système</h1>
          <p className="text-gray-400 text-sm mt-1">Gestion des paramètres et seuils du système</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchConfigs}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900/10 border border-[#055DBF]/20 rounded-lg text-white hover:bg-[#055DBF]/20 transition"
          >
            <RotateCcw size={16} />
            Rafraîchir
          </button>
          <span className="text-xs px-3 py-1.5 rounded-full bg-gray-900/10 border border-[#055DBF]/20 text-gray-400">
            {filteredConfigs.length} paramètres
          </span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          <AlertCircle size={16} />
          {message.text}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4 mb-6 mt-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un paramètre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/10 border border-[#055DBF]/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#055DBF]/50"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-900/10 border border-[#055DBF]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#055DBF]/50"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value} className="bg-gray-800">{c.label}</option>
            ))}
          </select>
          {(filterCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => { setFilterCategory('all'); setSearchQuery(''); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#055DBF]/20 rounded-lg transition"
            >
              <X size={16} /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Liste */}
      <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/10 border-b border-[#055DBF]/20">
              <tr>
                <th className="text-left  font-medium text-gray-400 px-4 py-3">Clé</th>
                <th className="text-left  font-medium text-gray-400 px-4 py-3">Valeur</th>
                <th className="text-left  font-medium text-gray-400 px-4 py-3">Description</th>
                <th className="text-left  font-medium text-gray-400 px-4 py-3">Catégorie</th>
                <th className="text-left  font-medium text-gray-400 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConfigs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">
                    Aucun paramètre trouvé
                  </td>
                </tr>
              ) : (
                filteredConfigs.map((config) => (
                  <tr key={config.id} className="border-b border-[#055DBF]/10 hover:bg-[#055DBF]/5 transition">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-white">{config.key}</span>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === config.id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-[#055DBF]/10 border border-[#055DBF]/20 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-[#055DBF]/50 w-full"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm text-gray-300">{config.value}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-400">{config.description || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={` px-2 py-1 rounded-full border ${getCategoryColor(config.category)}`}>
                        {getCategoryLabel(config.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === config.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveConfig(config.id)}
                            disabled={saving}
                            className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition disabled:opacity-50"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(config)}
                          disabled={!config.is_editable}
                          className={`p-1.5 rounded-lg transition ${
                            config.is_editable 
                              ? 'text-blue-400 hover:bg-blue-500/20' 
                              : 'text-gray-500 cursor-not-allowed opacity-50'
                          }`}
                          title={config.is_editable ? 'Modifier' : 'Non modifiable'}
                        >
                          <Edit size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <Edit size={14} className="text-blue-400" /> Modifiable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/30" /> Seuils
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500/30" /> Général
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500/30" /> Commercial
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500/30" /> Maintenance
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500/30" /> Système
        </span>
      </div>
    </div>
  );
}