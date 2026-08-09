import { useEffect, useState } from 'react';
import { Wrench, Clock, CheckCircle, AlertCircle, Search, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import MaintenanceModal from '../Maintenance/MaintenanceModal';
import MaintenanceDetails from '../Maintenance/MaintenanceDetails';

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

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Planifiée',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  in_progress: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const EMPTY_FORM = {
  component: 'filter',
  action: 'cleaned',
  description: '',
  technician_name: '',
  cost: '',
  next_due: '',
  status: 'scheduled',
};

export default function Maintenance() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterComponent, setFilterComponent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal de création/édition
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  // Modal de détails
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLog, setDetailsLog] = useState<MaintenanceLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/maintenance/');
      setLogs(res.data);
      setFilteredLogs(res.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // --- Gestion du formulaire (création/édition) ---

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
      console.log('bouton cliqué');
    setEditMode(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (log: MaintenanceLog) => {
    setEditMode(true);
    setEditId(log.id);
    setForm({
      component: log.component,
      action: log.action,
      description: log.description || '',
      technician_name: log.technician_name,
      cost: String(log.cost ?? ''),
      next_due: log.next_due || '',
      status: log.status,
    });
    setDetailsOpen(false); // on ferme les détails si on venait de là
    setModalOpen(true);
  };

  const handleSaveLog = async () => {
    try {
      const payload = {
        ...form,
        cost: form.cost === '' ? 0 : Number(form.cost),
      };

      if (editMode && editId !== null) {
        await api.put(`/maintenance/${editId}/`, payload);
      } else {
        await api.post('/maintenance/', payload);
      }

      setModalOpen(false);
      setForm(EMPTY_FORM);
      setEditMode(false);
      setEditId(null);
      fetchLogs();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
    }
  };

  const handleDeleteLog = async (id: number) => {
    if (!confirm('Supprimer cette intervention ?')) return;
    try {
      await api.delete(`/maintenance/${id}/`);
      fetchLogs();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  // --- Gestion des détails ---

  const openDetails = (log: MaintenanceLog) => {
    setDetailsLog(log);
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
          <h1 className="text-2xl md:text-3xl font-bold">
            Maintenance préventive
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Suivi des filtres, membranes, pompes et équipements
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="
            bg-[#00BFFF]
            text-black
            px-4
            py-2
            rounded-lg
            font-semibold
            flex
            items-center
            gap-2
          "
        >
          <Plus size={18} />
          Nouvelle intervention
        </button>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border border-[#12304a] rounded-xl p-5">
          <Wrench className="text-[#00BFFF] mb-3" />
          <p className="text-gray-400 text-sm">Total interventions</p>
          <h2 className="text-3xl font-bold">{logs.length}</h2>
        </div>

        <div className="border border-[#12304a] rounded-xl p-5">
          <Clock className="text-yellow-400 mb-3" />
          <p className="text-gray-400 text-sm">Planifiées</p>
          <h2 className="text-3xl font-bold">
            {logs.filter(l => l.status === "scheduled").length}
          </h2>
        </div>

        <div className="border border-[#12304a] rounded-xl p-5">
          <AlertCircle className="text-blue-400 mb-3" />
          <p className="text-gray-400 text-sm">En cours</p>
          <h2 className="text-3xl font-bold">
            {logs.filter(l => l.status === "in_progress").length}
          </h2>
        </div>

        <div className="border border-[#12304a] rounded-xl p-5">
          <CheckCircle className="text-green-400 mb-3" />
          <p className="text-gray-400 text-sm">Terminées</p>
          <h2 className="text-3xl font-bold">
            {logs.filter(l => l.status === "completed").length}
          </h2>
        </div>
      </div>

      {/* FILTRES */}
      <div className="border border-[#12304a] rounded-xl p-4 mb-6 flex flex-col lg:flex-row gap-4">

        <div className="flex items-center gap-2 border border-[#12304a] rounded-lg px-3 flex-1">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un technicien..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full py-2 text-sm"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-[#12304a] rounded-lg px-3 py-2"
        >
          <option value="all">Tous les statuts</option>
          <option value="scheduled">Planifié</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
        </select>

        <select
          value={filterComponent}
          onChange={e => setFilterComponent(e.target.value)}
          className="bg-gray-800 border border-[#12304a] rounded-lg px-3 py-2"
        >
          <option value="all">Tous les composants</option>
          {uniqueComponents.map(c => (
            <option key={c} value={c}>
              {COMPONENT_LABELS[c] || c}
            </option>
          ))}
        </select>

      </div>

      {/* TABLEAU */}
      <div className="border border-[#12304a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#081b2b] text-gray-400">
              <tr>
                <th className="p-4 text-left">Composant</th>
                <th className="p-4 text-left">Action</th>
                <th className="p-4 text-left">Technicien</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Aucune intervention trouvée
                  </td>
                </tr>
              )}

              {filteredLogs.map(log => (
                <tr
                  key={log.id}
                  onClick={() => openDetails(log)}
                  className="
                    border-t
                    border-[#12304a]
                    hover:bg-[#0b2235]
                    cursor-pointer
                  "
                >
                  <td className="p-4">
                    {COMPONENT_LABELS[log.component] || log.component}
                  </td>

                  <td className="p-4">
                    {ACTION_LABELS[log.action] || log.action}
                  </td>

                  <td className="p-4">
                    {log.technician_name}
                  </td>

                  <td className="p-4">
                    {new Date(log.created_at).toLocaleDateString('fr-FR')}
                  </td>

                  <td className="p-4">
                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        border
                        text-xs
                        ${STATUS_COLORS[log.status]}
                      `}
                    >
                      {STATUS_LABELS[log.status] || log.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div
                      className="flex justify-end gap-3"
                      onClick={e => e.stopPropagation()} // empêche l'ouverture des détails
                    >
                      <button onClick={() => openEditModal(log)}>
                        <Edit size={18} className="text-blue-400" />
                      </button>
                      <button onClick={() => handleDeleteLog(log.id)}>
                        <Trash2 size={18} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CRÉATION / ÉDITION */}
      <MaintenanceModal
        open={modalOpen}
        editMode={editMode}
        form={form}
        onClose={() => setModalOpen(false)}
        onChange={handleFormChange}
        onSubmit={handleSaveLog}
      />

      {/* MODAL DÉTAILS */}
      <MaintenanceDetails
        open={detailsOpen}
        log={detailsLog}
        onClose={() => setDetailsOpen(false)}
        onEdit={openEditModal}
      />

    </div>
  );
}