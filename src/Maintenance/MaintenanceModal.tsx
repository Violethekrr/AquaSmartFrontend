import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  editMode: boolean;
  form: {
    component: string;
    action: string;
    description: string;
    technician_name: string;
    cost: string;
    next_due: string;
    status: string;
  };
  onClose: () => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: () => void;
}

export default function MaintenanceModal({
  open,
  editMode,
  form,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setErrors({});
  }, [open]);

  if (!open) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.technician_name || form.technician_name.trim() === '') {
      newErrors.technician_name = 'Le nom du technicien est requis';
    }

    if (!form.description || form.description.trim() === '') {
      newErrors.description = 'La description est requise';
    }

    if (form.cost === '' || form.cost === null) {
      newErrors.cost = 'Le coût est requis';
    } else if (Number(form.cost) < 0) {
      newErrors.cost = 'Le coût ne peut pas être négatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-2 sm:p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#061421] border border-[#12304a] rounded-xl w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#12304a] shrink-0">
          <h2 className="text-lg sm:text-xl font-bold pr-2">
            {editMode ? 'Modifier une intervention' : 'Nouvelle intervention'}
          </h2>
          <button onClick={onClose} className="shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* CONTENU SCROLLABLE */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">

          {/* Composant + Action côte à côte sur écrans moyens+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Composant</label>
              <select
                name="component"
                value={form.component}
                onChange={onChange}
                className="w-full mt-1 p-2 rounded-lg bg-[#081b2b] border border-[#12304a] text-sm"
              >
                <option value="filter">Filtre</option>
                <option value="membrane">Membrane</option>
                <option value="pump">Pompe</option>
                <option value="uv">UV</option>
                <option value="sensor">Capteur</option>
                <option value="valve">Vanne</option>
                <option value="solar_panel">Panneau solaire</option>
                <option value="battery">Batterie</option>
              </select>
            </div>

            <div>
              <label className="text-sm">Action</label>
              <select
                name="action"
                value={form.action}
                onChange={onChange}
                className="w-full mt-1 p-2 rounded-lg bg-[#081b2b] border border-[#12304a] text-sm"
              >
                <option value="cleaned">Nettoyé</option>
                <option value="replaced">Remplacé</option>
                <option value="inspected">Inspecté</option>
                <option value="repaired">Réparé</option>
                <option value="calibrated">Calibré</option>
                <option value="installed">Installé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={3}
              className={`w-full mt-1 p-2 rounded-lg bg-[#081b2b] border text-sm ${
                errors.description ? 'border-red-500' : 'border-[#12304a]'
              }`}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} className="shrink-0" /> {errors.description}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm">Technicien</label>
            <input
              name="technician_name"
              value={form.technician_name}
              onChange={onChange}
              className={`w-full mt-1 p-2 rounded-lg bg-[#081b2b] border text-sm ${
                errors.technician_name ? 'border-red-500' : 'border-[#12304a]'
              }`}
            />
            {errors.technician_name && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} className="shrink-0" /> {errors.technician_name}
              </p>
            )}
          </div>

          {/* Coût + Date côte à côte sur écrans moyens+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Coût (FCFA)</label>
              <input
                type="number"
                name="cost"
                value={form.cost}
                onChange={onChange}
                min="0"
                className={`w-full mt-1 p-2 rounded-lg bg-[#081b2b] border text-sm ${
                  errors.cost ? 'border-red-500' : 'border-[#12304a]'
                }`}
              />
              {errors.cost && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" /> {errors.cost}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm">Prochaine maintenance</label>
              <input
                type="date"
                name="next_due"
                value={form.next_due}
                onChange={onChange}
                className="w-full mt-1 p-2 rounded-lg bg-[#081b2b] border border-[#12304a] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm">Statut</label>
            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="w-full mt-1 p-2 rounded-lg bg-[#081b2b] border border-[#12304a] text-sm"
            >
              <option value="scheduled">Planifiée</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>

        {/* FOOTER - boutons empilés sur mobile, côte à côte sinon */}
        <div className="p-4 sm:p-5 border-t border-[#12304a] flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#12304a] text-sm w-full sm:w-auto"
          >
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-[#00BFFF] text-black font-medium text-sm w-full sm:w-auto"
          >
            {editMode ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
}