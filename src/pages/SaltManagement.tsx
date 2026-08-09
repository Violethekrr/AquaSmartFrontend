import { useEffect, useState } from 'react';
import { Trash2, Beaker, Package, DollarSign, TrendingUp, Search, Eye, Pencil } from 'lucide-react';
import api from '../services/api';
import SaltModal from '../salt/SaltModal';
import SaltDetails from '../salt/SaltDetails';

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
  notes: string;
}

const QUALITY_LABELS: Record<string, string> = { raw: 'Brut', refined: 'Raffiné', industrial: 'Industriel' };

const QUALITY_COLORS: Record<string, string> = {
  raw: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  refined: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  industrial: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

const EMPTY_FORM = {
  batch_reference: '',
  harvest_date: '',
  quantity_kg: '',
  purity_percent: '',
  quality: 'raw',
  packaging_type: '',
  storage_location: '',
  sold: false,
  price_fcfa: '',
  buyer: '',
  notes: '',
};

const formatNumber = (n: any) => new Intl.NumberFormat('fr-FR').format(Number(n) || 0);

export default function SaltManagement() {
  const [batches, setBatches] = useState<SaltBatch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<SaltBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterQuality, setFilterQuality] = useState('all');
  const [filterSold, setFilterSold] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsBatch, setDetailsBatch] = useState<SaltBatch | null>(null);

  const fetchSalt = async () => {
    try {
      setLoading(true);
      const res = await api.get('/salt/');
      setBatches(res.data);
      setFilteredBatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalt(); }, []);

  useEffect(() => {
    let result = [...batches];
    if (filterQuality !== 'all') result = result.filter(b => b.quality === filterQuality);
    if (filterSold !== 'all') result = result.filter(b => b.sold === (filterSold === 'sold'));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.batch_reference?.toLowerCase().includes(q) ||
        b.storage_location?.toLowerCase().includes(q) ||
        b.buyer?.toLowerCase().includes(q)
      );
    }
    setFilteredBatches(result);
  }, [batches, filterQuality, filterSold, searchQuery]);

  // Totaux avec conversion explicite (les valeurs API arrivent en string)
  const totalKg = batches.reduce((sum, b) => sum + Number(b.quantity_kg || 0), 0);
  const totalSold = batches.filter(b => b.sold).reduce((sum, b) => sum + Number(b.quantity_kg || 0), 0);
  const totalRevenue = batches.filter(b => b.sold).reduce((sum, b) => sum + Number(b.price_fcfa || 0), 0);
  const availableCount = batches.filter(b => !b.sold).length;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openCreateModal = () => {
    setEditMode(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (batch: SaltBatch) => {
    setEditMode(true);
    setEditId(batch.id);
    setForm({
      batch_reference: batch.batch_reference,
      harvest_date: batch.harvest_date || '',
      quantity_kg: String(batch.quantity_kg ?? ''),
      purity_percent: String(batch.purity_percent ?? ''),
      quality: batch.quality,
      packaging_type: batch.packaging_type || '',
      storage_location: batch.storage_location || '',
      sold: batch.sold,
      price_fcfa: String(batch.price_fcfa ?? ''),
      buyer: batch.buyer || '',
      notes: batch.notes || '',
    });
    setDetailsOpen(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        batch_reference: form.batch_reference,
        harvest_date: form.harvest_date || null,
        quantity_kg: Number(form.quantity_kg) || 0,
        purity_percent: form.purity_percent === '' ? null : Number(form.purity_percent),
        quality: form.quality,
        packaging_type: form.packaging_type,
        storage_location: form.storage_location,
        sold: form.sold,
        price_fcfa: form.price_fcfa === '' ? 0 : Number(form.price_fcfa),
        buyer: form.buyer,
        notes: form.notes,
      };

      if (editMode && editId !== null) {
        await api.put(`/salt/${editId}/`, payload);
      } else {
        await api.post('/salt/', payload);
      }

      closeModal();
      fetchSalt();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce lot ?')) return;
    try {
      await api.delete(`/salt/${id}/`);
      fetchSalt();
    } catch (err) {
      console.error('Erreur suppression :', err);
    }
  };

  const openDetails = (batch: SaltBatch) => {
    setDetailsBatch(batch);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#055DBF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gestion des sous-produits (sel)</h1>
          <p className="text-gray-400 text-sm mt-2">Suivi de la production, stockage et vente du sel</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#00BFFF] text-black px-4 py-2 rounded-lg font-medium hover:bg-cyan-300 transition"
        >
          <Beaker size={18} /> Nouveau lot
        </button>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border border-[#12304a] rounded-xl p-5">
          <Package className="text-[#00BFFF] mb-3" />
          <p className="text-gray-400 text-sm">Stock total</p>
          <h2 className="text-2xl md:text-3xl font-bold">{formatNumber(totalKg)} Kg</h2>
        </div>
        <div className="border border-[#12304a] rounded-xl p-5">
          <TrendingUp className="text-green-400 mb-3" />
          <p className="text-gray-400 text-sm">Sel vendu</p>
          <h2 className="text-2xl md:text-3xl font-bold">{formatNumber(totalSold)} Kg</h2>
        </div>
        <div className="border border-[#12304a] rounded-xl p-5">
          <DollarSign className="text-yellow-400 mb-3" />
          <p className="text-gray-400 text-sm">Revenu total</p>
          <h2 className="text-2xl md:text-3xl font-bold">{formatNumber(totalRevenue)} FCFA</h2>
        </div>
        <div className="border border-[#12304a] rounded-xl p-5">
          <Beaker className="text-purple-400 mb-3" />
          <p className="text-gray-400 text-sm">Lots disponibles</p>
          <h2 className="text-2xl md:text-3xl font-bold">{availableCount}</h2>
        </div>
      </div>

      {/* FILTRES */}
      <div className="border border-[#12304a] rounded-xl p-4 mb-6 flex flex-col lg:flex-row gap-4">
        <div className="flex items-center gap-2 border border-[#12304a] rounded-lg px-3 flex-1">
          <Search size={18} className="text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un lot..."
            className="bg-transparent outline-none w-full py-2 text-sm"
          />
        </div>

        <select value={filterQuality} onChange={e => setFilterQuality(e.target.value)} className="bg-gray-800 border border-[#12304a] rounded-lg px-3 py-2 text-sm">
          <option value="all">Toutes qualités</option>
          <option value="raw">Brut</option>
          <option value="refined">Raffiné</option>
          <option value="industrial">Industriel</option>
        </select>

        <select value={filterSold} onChange={e => setFilterSold(e.target.value)} className="bg-gray-800 border border-[#12304a] rounded-lg px-3 py-2 text-sm">
          <option value="all">Tous</option>
          <option value="sold">Vendus</option>
          <option value="available">Disponibles</option>
        </select>
      </div>

      {/* TABLEAU */}
      <div className="border border-[#12304a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#081b2b] text-gray-400">
              <tr>
                <th className="p-4 text-left">Référence</th>
                <th className="p-4 text-left">Qualité</th>
                <th className="p-4 text-left">Quantité</th>
                <th className="p-4 text-left">Pureté</th>
                <th className="p-4 text-left">Stockage</th>
                <th className="p-4 text-left">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Aucun lot trouvé</td></tr>
              )}
              {filteredBatches.map(batch => (
                <tr
                  key={batch.id}
                  onClick={() => openDetails(batch)}
                  className="border-t border-[#12304a] hover:bg-[#0b2235] cursor-pointer"
                >
                  <td className="p-4">{batch.batch_reference}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${QUALITY_COLORS[batch.quality] || ''}`}>
                      {QUALITY_LABELS[batch.quality] || batch.quality}
                    </span>
                  </td>
                  <td className="p-4">{formatNumber(batch.quantity_kg)} Kg</td>
                  <td className="p-4">{batch.purity_percent}%</td>
                  <td className="p-4">{batch.storage_location || '-'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${
                      batch.sold ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {batch.sold ? 'Vendu' : 'Disponible'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-3" onClick={e => e.stopPropagation()}>
                      <button className="text-cyan-400 hover:text-cyan-300" title="Voir" onClick={() => openDetails(batch)}>
                        <Eye size={18} />
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300" title="Modifier" onClick={() => openEditModal(batch)}>
                        <Pencil size={18} />
                      </button>
                      <button className="text-red-400 hover:text-red-300" title="Supprimer" onClick={() => handleDelete(batch.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SaltModal
        open={modalOpen}
        editMode={editMode}
        form={form}
        onClose={closeModal}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
      />

      <SaltDetails
        open={detailsOpen}
        batch={detailsBatch}
        onClose={() => setDetailsOpen(false)}
        onEdit={openEditModal}
      />

    </div>
  );
}