import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  editMode: boolean;
  form: {
    full_name: string;
    email: string;
    password: string;
    role: string;
    is_active: boolean;
  };
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
}

export default function UserModal({ open, editMode, form, onClose, onChange, onSubmit }: Props) {
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

    if (!form.full_name.trim()) newErrors.full_name = 'Le nom complet est requis';

    if (!form.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Format d'email invalide";

    // Le mot de passe est optionnel : vide = généré automatiquement (création) ou inchangé (édition)
    if (form.password && form.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
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
      <div className="bg-[#061421] border border-[#12304a] rounded-xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col">

        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#12304a] shrink-0">
          <h2 className="text-lg sm:text-xl font-bold">{editMode ? 'Modifier' : 'Nouvel'} utilisateur</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">

          <div>
            <label className="text-sm text-gray-400">Nom complet</label>
            <input name="full_name" value={form.full_name} onChange={onChange} className={inputClass('full_name')} />
            <ErrorMsg field="full_name" />
          </div>

          <div>
            <label className="text-sm text-gray-400">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} className={inputClass('email')} />
            <ErrorMsg field="email" />
          </div>

        <div>
            <label className="text-sm text-gray-400">
              Mot de passe <span className="text-gray-500">(optionnel)</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder={editMode ? '••••••••' : 'Laisser vide pour générer automatiquement'}
              className={inputClass('password')}
            />
            <ErrorMsg field="password" />
            {!editMode && (
              <p className="text-xs text-gray-500 mt-1">
                Si tu laisses ce champ vide, un mot de passe temporaire sera généré et affiché après la création.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Rôle</label>
              <select name="role" value={form.role} onChange={onChange} className={inputClass('role')}>
                <option value="admin">Administrateur</option>
                <option value="tech">Technicien</option>
                <option value="operator">Opérateur</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400">Statut</label>
              <select
                name="is_active"
                value={form.is_active ? 'true' : 'false'}
                onChange={onChange}
                className={inputClass('is_active')}
              >
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-[#12304a] flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#12304a] text-sm w-full sm:w-auto">Annuler</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-[#00BFFF] text-black font-medium text-sm w-full sm:w-auto">
            {editMode ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
}