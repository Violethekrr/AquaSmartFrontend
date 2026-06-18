
import React, { useEffect, useState } from 'react';
import { Beaker, Package, DollarSign, TrendingUp, Search, X, Filter } from 'lucide-react';
import api from '../services/api';

interface SaltBatch {
  id: number;
  batch_reference: string;
  harvest_date: string;
  quantity_kg: number;
  purity_percent: number;
  quality: string;
  packaging_type: string;
  storage_location: string;
  sold: boolean;
  price_fcfa: number;
  buyer: string;
}

const QUALITY_LABELS: Record<string, string> = {
  raw: 'Brut',
  refined: 'Raffiné',
  industrial: 'Industriel',
};

export default function SaltManagement() {
  const [batches, setBatches] = useState<SaltBatch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<SaltBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuality, setFilterQuality] = useState('all');
  const [filterSold, setFilterSold] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get('/salt/');
        setBatches(res.data);
        setFilteredBatches(res.data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    let result = [...batches];
    if (filterQuality !== 'all') {
      result = result.filter(b => b.quality === filterQuality);
    }
    if (filterSold !== 'all') {
      result = result.filter(b => b.sold === (filterSold === 'sold'));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(b => 
        b.batch_reference?.toLowerCase().includes(q) ||
        b.buyer?.toLowerCase().includes(q) ||
        b.storage_location?.toLowerCase().includes(q)
      );
    }
    setFilteredBatches(result);
  }, [batches, filterQuality, filterSold, searchQuery]);

  const totalKg = batches.reduce((sum, b) => sum + b.quantity_kg, 0);
  const totalSold = batches.filter(b => b.sold).reduce((sum, b) => sum + b.quantity_kg, 0);
  const totalRevenue = batches.filter(b => b.sold).reduce((sum, b) => sum + (b.quantity_kg * b.price_fcfa), 0);

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
          <h1 className="text-2xl font-bold mb-2 text-white">Gestion des sous-produits (sel)</h1>
          <p className="text-gray-400 text-sm mb-6">Suivi de la production de sel, évaporation, vente</p>
        </div>
  
    </div>
  );
}