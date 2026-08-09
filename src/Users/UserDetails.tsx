import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit, Mail, Shield, Calendar } from 'lucide-react';

interface UserType {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = { admin: 'Administrateur', tech: 'Technicien', operator: 'Opérateur' };

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  tech: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  operator: 'bg-green-500/15 text-green-400 border-green-500/30',
};

interface Props {
  open: boolean;
  user: UserType | null;
  onClose: () => void;
  onEdit: (user: UserType) => void;
}

const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '-');

export default function UserDetails({ open, user, onClose, onEdit }: Props) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !user) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4" onClick={handleOverlayClick}>
      <div className="bg-[#061421] border border-[#12304a] rounded-xl w-full max-w-lg max-h-[95vh] flex flex-col">

        <div className="flex justify-between items-center border-b border-[#12304a] p-4 sm:p-5 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold">Détails utilisateur</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">

          <div className="flex items-center gap-3 pb-4 border-b border-[#12304a]">
            <div className="w-12 h-12 rounded-full bg-[#12304a] flex items-center justify-center text-lg font-bold shrink-0">
              {user.full_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-bold">{user.full_name}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs border ${ROLE_COLORS[user.role]}`}>
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
          </div>

          <p className="flex items-center gap-2 text-sm"><Mail size={16} className="text-gray-400 shrink-0" /> {user.email}</p>
          <p className="flex items-center gap-2 text-sm">
            <Shield size={16} className="text-gray-400 shrink-0" />
            <span className={user.is_active ? 'text-green-400' : 'text-red-400'}>
              {user.is_active ? 'Actif' : 'Inactif'}
            </span>
          </p>
          <p className="flex items-center gap-2 text-sm"><Calendar size={16} className="text-gray-400 shrink-0" /> Créé le {formatDate(user.created_at)}</p>
        </div>

        <div className="p-4 sm:p-5 border-t border-[#12304a] flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#12304a] text-sm w-full sm:w-auto">Fermer</button>
          <button onClick={() => onEdit(user)} className="px-4 py-2 rounded-lg bg-[#00BFFF] text-black font-medium flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
            <Edit size={16} /> Modifier
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
}