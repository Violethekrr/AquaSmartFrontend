import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit, AlertTriangle } from 'lucide-react';

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
  scheduled: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  in_progress: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  completed: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

interface Props {
  open: boolean;
  log: MaintenanceLog | null;
  onClose: () => void;
  onEdit: (log: MaintenanceLog) => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('fr-FR');
};

const formatCost = (cost: number) => {
  return new Intl.NumberFormat('fr-FR').format(cost);
};

const isOverdue = (nextDue: string) => {
  if (!nextDue) return false;
  const diffDays =
    (new Date(nextDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diffDays < 0;
};

const isSoon = (nextDue: string) => {
  if (!nextDue) return false;
  const diffDays =
    (new Date(nextDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
};

export default function MaintenanceDetails({
  open,
  log,
  onClose,
  onEdit,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !log) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const overdue = isOverdue(log.next_due);
  const soon = isSoon(log.next_due);

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#061421] border border-[#12304a] rounded-xl w-full max-w-lg max-h-[95vh] flex flex-col">

        <div className="flex justify-between items-center border-b border-[#12304a] p-4 sm:p-5 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold">Détails intervention</h2>
          <button onClick={onClose} className="shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto text-sm sm:text-base">
          <p><b>Composant :</b> {COMPONENT_LABELS[log.component] || log.component}</p>
          <p><b>Action :</b> {ACTION_LABELS[log.action] || log.action}</p>
          <p className="break-words"><b>Description :</b> {log.description || '-'}</p>
          <p><b>Technicien :</b> {log.technician_name}</p>
          <p><b>Coût :</b> {formatCost(log.cost)} FCFA</p>
          <p><b>Date :</b> {formatDate(log.created_at)}</p>

          <div className="flex flex-wrap items-center gap-2">
            <span><b>Prochaine maintenance :</b> {formatDate(log.next_due)}</span>
            {overdue && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border bg-red-500/15 text-red-400 border-red-500/30 whitespace-nowrap">
                <AlertTriangle size={12} /> En retard
              </span>
            )}
            {!overdue && soon && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border bg-orange-500/15 text-orange-400 border-orange-500/30 whitespace-nowrap">
                <AlertTriangle size={12} /> Bientôt
              </span>
            )}
          </div>

          <div>
            <b>Statut :</b>{' '}
            <span
              className={`px-3 py-1 rounded-full border text-xs ${
                STATUS_COLORS[log.status] || ''
              }`}
            >
              {STATUS_LABELS[log.status] || log.status}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-[#12304a] flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#12304a] text-sm w-full sm:w-auto"
          >
            Fermer
          </button>
          <button
            onClick={() => onEdit(log)}
            className="px-4 py-2 rounded-lg bg-[#00BFFF] text-black font-medium flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
          >
            <Edit size={16} /> Modifier
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
}