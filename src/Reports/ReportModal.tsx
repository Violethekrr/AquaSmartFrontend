import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  editMode: boolean;
  form: {
    water_produced_liters: string;
    water_distributed_liters: string;
    energy_used_kwh: string;
    energy_produced_kwh: string;
    avg_salinity_in_ppm: string;
    avg_salinity_out_ppm: string;
    avg_pH: string;
    avg_pressure_bar: string;
    salt_collected_kg: string;
    total_revenue_fcfa: string;
    total_expenses_fcfa: string;
    notes: string;
  };
  onClose: () => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: () => void;
}

export default function ReportModal({
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

    // Seul champ réellement obligatoire dans le modèle (pas de null, pas de default)
    if (form.avg_salinity_out_ppm === '') {
      newErrors.avg_salinity_out_ppm = 'La salinité de sortie est requise';
    } else if (Number(form.avg_salinity_out_ppm) < 0) {
      newErrors.avg_salinity_out_ppm = 'La valeur ne peut pas être négative';
    }

    if (form.avg_pH !== '' && (Number(form.avg_pH) < 0 || Number(form.avg_pH) > 14)) {
      newErrors.avg_pH = 'Le pH doit être entre 0 et 14';
    }

    const nonNegativeFields: [keyof typeof form, string][] = [
      ['water_produced_liters', 'La production ne peut pas être négative'],
      ['water_distributed_liters', 'La distribution ne peut pas être négative'],
      ['energy_used_kwh', "L'énergie utilisée ne peut pas être négative"],
      ['energy_produced_kwh', "L'énergie produite ne peut pas être négative"],
      ['salt_collected_kg', 'Le sel collecté ne peut pas être négatif'],
      ['total_revenue_fcfa', 'Le revenu ne peut pas être négatif'],
      ['total_expenses_fcfa', 'Les dépenses ne peuvent pas être négatives'],
    ];

    nonNegativeFields.forEach(([field, message]) => {
      if (form[field] !== '' && Number(form[field]) < 0) {
        newErrors[field] = message;
      }
    });

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

  const inputClass = (field: string) =>
    `w-full mt-1 p-2 rounded-lg bg-[#081b2b] border text-sm ${
      errors[field] ? 'border-red-500' : 'border-[#12304a]'
    }`;

  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
        <AlertCircle size={12} className="shrink-0" /> {errors[field]}
      </p>
    ) : null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-2 sm:p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#061421] border border-[#12304a] rounded-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">

        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#12304a] shrink-0">
          <h2 className="text-lg sm:text-xl font-bold pr-2">
            {editMode ? 'Modifier le rapport' : 'Nouveau rapport de production'}
          </h2>
          <button onClick={onClose} className="shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5 space-y-6">

          {!editMode && (
            <p className="text-xs text-gray-400 -mt-2">
              La date du rapport sera définie automatiquement à la création.
            </p>
          )}

          {/* SECTION PRODUCTION D'EAU */}
          <div>
            <h3 className="text-sm font-semibold text-[#00BFFF] mb-3">Production d'eau</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Eau produite (litres)</label>
                <input
                  type="number" name="water_produced_liters" value={form.water_produced_liters}
                  onChange={onChange} min="0" step="0.01"
                  className={inputClass('water_produced_liters')}
                />
                <ErrorMsg field="water_produced_liters" />
              </div>
              <div>
                <label className="text-sm">Eau distribuée (litres)</label>
                <input
                  type="number" name="water_distributed_liters" value={form.water_distributed_liters}
                  onChange={onChange} min="0" step="0.01"
                  className={inputClass('water_distributed_liters')}
                />
                <ErrorMsg field="water_distributed_liters" />
              </div>
            </div>
          </div>

          {/* SECTION ÉNERGIE */}
          <div>
            <h3 className="text-sm font-semibold text-[#00BFFF] mb-3">Énergie</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Énergie utilisée (kWh)</label>
                <input
                  type="number" name="energy_used_kwh" value={form.energy_used_kwh}
                  onChange={onChange} min="0" step="0.01"
                  className={inputClass('energy_used_kwh')}
                />
                <ErrorMsg field="energy_used_kwh" />
              </div>
              <div>
                <label className="text-sm">Énergie produite (kWh)</label>
                <input
                  type="number" name="energy_produced_kwh" value={form.energy_produced_kwh}
                  onChange={onChange} min="0" step="0.01"
                  className={inputClass('energy_produced_kwh')}
                />
                <ErrorMsg field="energy_produced_kwh" />
              </div>
            </div>
          </div>

          {/* SECTION QUALITÉ DE L'EAU */}
          <div>
            <h3 className="text-sm font-semibold text-[#00BFFF] mb-3">Qualité de l'eau</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Salinité entrée (ppm)</label>
                <input
                  type="number" name="avg_salinity_in_ppm" value={form.avg_salinity_in_ppm}
                  onChange={onChange} min="0" step="0.01"
                  className={inputClass('avg_salinity_in_ppm')}
                />
                <ErrorMsg field="avg_salinity_in_ppm" />
              </div>
              <div>
                <label className="text-sm">
                  Salinité sortie (ppm) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number" name="avg_salinity_out_ppm" value={form.avg_salinity_out_ppm}
                  onChange={onChange} min="0" step="0.01"
                  className={inputClass('avg_salinity_out_ppm')}
                />
                <ErrorMsg field="avg_salinity_out_ppm" />
              </div>
              <div>
                <label className="text-sm">pH moyen</label>
                <input
                  type="number" name="avg_pH" value={form.avg_pH}
                  onChange={onChange} min="0" max="14" step="0.01"
                  className={inputClass('avg_pH')}
                />
                <ErrorMsg field="avg_pH" />
              </div>
              <div>
                <label className="text-sm">Pression moyenne (bar)</label>
                <input
                  type="number" name="avg_pressure_bar" value={form.avg_pressure_bar}
                  onChange={onChange} min="0" step="0.01"
                  className={inputClass('avg_pressure_bar')}
                />
                <ErrorMsg field="avg_pressure_bar" />
              </div>
            </div>
          </div>

          {/* SECTION SEL & FINANCES */}
          <div>
            <h3 className="text-sm font-semibold text-[#00BFFF] mb-3">Sel & Finances</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Sel collecté (kg)</label>
                <input
                  type="number" name="salt_collected_kg" value={form.salt_collected_kg}
                  onChange={onChange} min="0" step="0.01"
                  className={inputClass('salt_collected_kg')}
                />
                <ErrorMsg field="salt_collected_kg" />
              </div>
              <div />
              <div>
                <label className="text-sm">Revenu total (FCFA)</label>
                <input
                  type="number" name="total_revenue_fcfa" value={form.total_revenue_fcfa}
                  onChange={onChange} min="0" step="0.01"
                  className={inputClass('total_revenue_fcfa')}
                />
                <ErrorMsg field="total_revenue_fcfa" />
              </div>
              <div>
                <label className="text-sm">Dépenses totales (FCFA)</label>
                <input
                  type="number" name="total_expenses_fcfa" value={form.total_expenses_fcfa}
                  onChange={onChange} min="0" step="0.01"
                  className={inputClass('total_expenses_fcfa')}
                />
                <ErrorMsg field="total_expenses_fcfa" />
              </div>
            </div>
          </div>

          {/* NOTES */}
          <div>
            <label className="text-sm">Notes</label>
            <textarea
              name="notes" value={form.notes} onChange={onChange} rows={3}
              className={inputClass('notes')}
            />
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-[#12304a] flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#12304a] text-sm w-full sm:w-auto">
            Annuler
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-[#00BFFF] text-black font-medium text-sm w-full sm:w-auto">
            {editMode ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
}