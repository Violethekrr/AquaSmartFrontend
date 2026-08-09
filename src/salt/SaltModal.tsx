import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  editMode: boolean;
  form: {
    batch_reference: string;
    harvest_date: string;
    quantity_kg: string;
    purity_percent: string;
    quality: string;
    packaging_type: string;
    storage_location: string;
    sold: boolean;
    price_fcfa: string;
    buyer: string;
    notes: string;
  };
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

export default function SaltModal({ open, editMode, form, onClose, onChange, onSubmit }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => { if (open) setErrors({}); }, [open]);

  if (!open) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.batch_reference.trim()) newErrors.batch_reference = 'La référence est requise';

    if (form.quantity_kg === '') newErrors.quantity_kg = 'La quantité est requise';
    else if (Number(form.quantity_kg) <= 0) newErrors.quantity_kg = 'La quantité doit être positive';

    if (form.purity_percent !== '') {
      const p = Number(form.purity_percent);
      if (p < 0 || p > 100) newErrors.purity_percent = 'La pureté doit être entre 0 et 100';
    }

    if (form.sold) {
      if (!form.buyer.trim()) newErrors.buyer = "L'acheteur est requis pour un lot vendu";
      if (form.price_fcfa === '' || Number(form.price_fcfa) <= 0) newErrors.price_fcfa = 'Le prix est requis pour un lot vendu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => { if (validate()) onSubmit(); };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const inputClass = (field: string) =>
    `w-full mt-1 p-2 rounded-lg bg-[#081b2b] border text-sm ${errors[field] ? 'border-red-500' : 'border-[#12304a]'}`;

  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
        <AlertCircle size={12} className="shrink-0" /> {errors[field]}
      </p>
    ) : null;

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-2 sm:p-4" onClick={handleOverlayClick}>
      <div className="bg-[#061421] border border-[#12304a] rounded-xl w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">

        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#12304a] shrink-0">
          <h2 className="text-lg sm:text-xl font-bold">{editMode ? 'Modifier le lot' : 'Ajouter un nouveau lot'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">

          <div>
            <label className="text-sm text-gray-400">Référence du lot</label>
            <input name="batch_reference" value={form.batch_reference} onChange={onChange} className={inputClass('batch_reference')} />
            <ErrorMsg field="batch_reference" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Date de récolte</label>
              <input type="date" name="harvest_date" value={form.harvest_date} onChange={onChange} className={inputClass('harvest_date')} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Qualité</label>
              <select name="quality" value={form.quality} onChange={onChange} className={inputClass('quality')}>
                <option value="raw">Brut</option>
                <option value="refined">Raffiné</option>
                <option value="industrial">Industriel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Quantité (Kg)</label>
              <input type="number" name="quantity_kg" value={form.quantity_kg} onChange={onChange} min="0" step="0.01" className={inputClass('quantity_kg')} />
              <ErrorMsg field="quantity_kg" />
            </div>
            <div>
              <label className="text-sm text-gray-400">Pureté (%)</label>
              <input type="number" name="purity_percent" value={form.purity_percent} onChange={onChange} min="0" max="100" step="0.01" className={inputClass('purity_percent')} />
              <ErrorMsg field="purity_percent" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Type emballage</label>
              <input name="packaging_type" value={form.packaging_type} onChange={onChange} className={inputClass('packaging_type')} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Lieu stockage</label>
              <input name="storage_location" value={form.storage_location} onChange={onChange} className={inputClass('storage_location')} />
            </div>
          </div>

          <div className="border border-[#12304a] rounded-lg p-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="sold" checked={form.sold} onChange={onChange} className="w-4 h-4" />
              Ce lot est vendu
            </label>

            {form.sold && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="text-sm text-gray-400">Prix (FCFA)</label>
                  <input type="number" name="price_fcfa" value={form.price_fcfa} onChange={onChange} min="0" className={inputClass('price_fcfa')} />
                  <ErrorMsg field="price_fcfa" />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Acheteur</label>
                  <input name="buyer" value={form.buyer} onChange={onChange} className={inputClass('buyer')} />
                  <ErrorMsg field="buyer" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400">Notes</label>
            <textarea name="notes" value={form.notes} onChange={onChange} rows={3} className={inputClass('notes')} />
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-[#12304a] flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#12304a] text-sm w-full sm:w-auto">Annuler</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-[#00BFFF] text-black font-medium text-sm w-full sm:w-auto">
            {editMode ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
}