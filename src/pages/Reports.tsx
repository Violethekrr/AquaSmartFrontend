import { useEffect, useState } from 'react';
import { Droplets, Wallet, Package, Zap, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import ReportModal from '../Reports/ReportModal';
import ReportDetails from '../Reports/ReportDetails';

interface ProductionReport {
  id: number;
  report_date: string;
  water_produced_liters: number;
  water_distributed_liters: number;
  energy_used_kwh: number;
  energy_produced_kwh: number;
  avg_salinity_in_ppm: number | null;
  avg_salinity_out_ppm: number;
  avg_pH: number | null;
  avg_pressure_bar: number | null;
  salt_collected_kg: number;
  total_revenue_fcfa: number;
  total_expenses_fcfa: number;
  notes: string | null;
  created_at: string;
}

const EMPTY_FORM = {
  water_produced_liters: '0',
  water_distributed_liters: '0',
  energy_used_kwh: '0',
  energy_produced_kwh: '0',
  avg_salinity_in_ppm: '',
  avg_salinity_out_ppm: '',
  avg_pH: '',
  avg_pressure_bar: '',
  salt_collected_kg: '0',
  total_revenue_fcfa: '0',
  total_expenses_fcfa: '0',
  notes: '',
};

const PERIOD_OPTIONS = [
  { value: '7', label: '7 derniers jours' },
  { value: '30', label: '30 derniers jours' },
  { value: 'all', label: 'Toute la période' },
];

const formatNumber = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

export default function Reports() {
  const [reports, setReports] = useState<ProductionReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<ProductionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsReport, setDetailsReport] = useState<ProductionReport | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/production/?ordering=-report_date');
      setReports(res.data);
      setFilteredReports(res.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (period === 'all') {
      setFilteredReports(reports);
      return;
    }
    const days = Number(period);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    setFilteredReports(reports.filter(r => new Date(r.report_date) >= cutoff));
  }, [reports, period]);

  // --- Statistiques calculées sur la période filtrée ---
  const totalProduction = filteredReports.reduce((sum, r) => sum + (Number(r.water_produced_liters) || 0), 0);
  const totalSalt = filteredReports.reduce((sum, r) => sum + (Number(r.salt_collected_kg) || 0), 0);
  const totalProfit = filteredReports.reduce(
    (sum, r) => sum + ((Number(r.total_revenue_fcfa) || 0) - (Number(r.total_expenses_fcfa) || 0)), 0
  );
  const netEnergy = filteredReports.reduce(
    (sum, r) => sum + ((Number(r.energy_produced_kwh) || 0) - (Number(r.energy_used_kwh) || 0)), 0
  );

  // --- Formulaire ---

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setEditMode(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (report: ProductionReport) => {
    setEditMode(true);
    setEditId(report.id);
    setForm({
      water_produced_liters: String(report.water_produced_liters ?? '0'),
      water_distributed_liters: String(report.water_distributed_liters ?? '0'),
      energy_used_kwh: String(report.energy_used_kwh ?? '0'),
      energy_produced_kwh: String(report.energy_produced_kwh ?? '0'),
      avg_salinity_in_ppm: report.avg_salinity_in_ppm !== null ? String(report.avg_salinity_in_ppm) : '',
      avg_salinity_out_ppm: String(report.avg_salinity_out_ppm ?? ''),
      avg_pH: report.avg_pH !== null ? String(report.avg_pH) : '',
      avg_pressure_bar: report.avg_pressure_bar !== null ? String(report.avg_pressure_bar) : '',
      salt_collected_kg: String(report.salt_collected_kg ?? '0'),
      total_revenue_fcfa: String(report.total_revenue_fcfa ?? '0'),
      total_expenses_fcfa: String(report.total_expenses_fcfa ?? '0'),
      notes: report.notes || '',
    });
    setDetailsOpen(false);
    setModalOpen(true);
  };

  const handleSaveReport = async () => {
    try {
      const payload = {
        water_produced_liters: Number(form.water_produced_liters) || 0,
        water_distributed_liters: Number(form.water_distributed_liters) || 0,
        energy_used_kwh: Number(form.energy_used_kwh) || 0,
        energy_produced_kwh: Number(form.energy_produced_kwh) || 0,
        avg_salinity_in_ppm: form.avg_salinity_in_ppm === '' ? null : Number(form.avg_salinity_in_ppm),
        avg_salinity_out_ppm: Number(form.avg_salinity_out_ppm),
        avg_pH: form.avg_pH === '' ? null : Number(form.avg_pH),
        avg_pressure_bar: form.avg_pressure_bar === '' ? null : Number(form.avg_pressure_bar),
        salt_collected_kg: Number(form.salt_collected_kg) || 0,
        total_revenue_fcfa: Number(form.total_revenue_fcfa) || 0,
        total_expenses_fcfa: Number(form.total_expenses_fcfa) || 0,
        notes: form.notes || null,
      };

      if (editMode && editId !== null) {
        await api.put(`/production/${editId}/`, payload);
      } else {
        await api.post('/production/', payload);
      }

      setModalOpen(false);
      setForm(EMPTY_FORM);
      setEditMode(false);
      setEditId(null);
      fetchReports();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!confirm('Supprimer ce rapport ?')) return;
    try {
      await api.delete(`/production/${id}/`);
      fetchReports();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const openDetails = (report: ProductionReport) => {
    setDetailsReport(report);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#055DBF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Rapports de production</h1>
          <p className="text-gray-400 text-sm mt-2">
            Suivi de la production, énergie, qualité de l'eau et finances
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#00BFFF] text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <Plus size={18} />
          Nouveau rapport
        </button>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border border-[#12304a] rounded-xl p-5">
          <Droplets className="text-blue-400 mb-3" />
          <p className="text-gray-400 text-sm">Production totale</p>
          <h2 className="text-2xl md:text-3xl font-bold">{formatNumber(totalProduction / 1000)} m³</h2>
        </div>

        <div className="border border-[#12304a] rounded-xl p-5">
          <Zap className={`mb-3 ${netEnergy >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          <p className="text-gray-400 text-sm">Bilan énergétique</p>
          <h2 className={`text-2xl md:text-3xl font-bold ${netEnergy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netEnergy >= 0 ? '+' : ''}{formatNumber(netEnergy)} kWh
          </h2>
        </div>

        <div className="border border-[#12304a] rounded-xl p-5">
          <Package className="text-green-400 mb-3" />
          <p className="text-gray-400 text-sm">Sel collecté</p>
          <h2 className="text-2xl md:text-3xl font-bold">{formatNumber(totalSalt)} kg</h2>
        </div>

        <div className="border border-[#12304a] rounded-xl p-5">
          <Wallet className={`mb-3 ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          <p className="text-gray-400 text-sm">Bénéfice net</p>
          <h2 className={`text-2xl md:text-3xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatNumber(totalProfit)} FCFA
          </h2>
        </div>
      </div>

      {/* FILTRE PÉRIODE */}
      <div className="border border-[#12304a] rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-sm text-gray-400">Période :</span>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="bg-gray-800 border border-[#12304a] rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
        >
          {PERIOD_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* TABLEAU */}
      <div className="border border-[#12304a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#081b2b] text-gray-400">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Production</th>
                <th className="p-4 text-left">Salinité sortie</th>
                <th className="p-4 text-left">pH</th>
                <th className="p-4 text-left">Sel</th>
                <th className="p-4 text-left">Bénéfice</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Aucun rapport trouvé pour cette période
                  </td>
                </tr>
              )}

              {filteredReports.map(report => {
                const profit = (Number(report.total_revenue_fcfa) || 0) - (Number(report.total_expenses_fcfa) || 0);
                return (
                  <tr
                    key={report.id}
                    onClick={() => openDetails(report)}
                    className="border-t border-[#12304a] hover:bg-[#0b2235] cursor-pointer"
                  >
                    <td className="p-4">{new Date(report.report_date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4">{formatNumber(Number(report.water_produced_liters) / 1000)} m³</td>
                    <td className="p-4">{formatNumber(Number(report.avg_salinity_out_ppm))} ppm</td>
                    <td className="p-4">{report.avg_pH ?? '-'}</td>
                    <td className="p-4">{formatNumber(Number(report.salt_collected_kg))} kg</td>
                    <td className={`p-4 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatNumber(profit)} FCFA
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-3" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEditModal(report)}>
                          <Edit size={18} className="text-blue-400" />
                        </button>
                        <button onClick={() => handleDeleteReport(report.id)}>
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ReportModal
        open={modalOpen}
        editMode={editMode}
        form={form}
        onClose={() => setModalOpen(false)}
        onChange={handleFormChange}
        onSubmit={handleSaveReport}
      />

      <ReportDetails
        open={detailsOpen}
        report={detailsReport}
        onClose={() => setDetailsOpen(false)}
        onEdit={openEditModal}
      />

    </div>
  );
}