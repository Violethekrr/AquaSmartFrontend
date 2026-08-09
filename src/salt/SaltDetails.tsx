import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit } from 'lucide-react';

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

interface Props {
  open: boolean;
  batch: SaltBatch | null;
  onClose: () => void;
  onEdit: (batch: SaltBatch) => void;
}

const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const formatNumber = (n: any) => new Intl.NumberFormat('fr-FR').format(Number(n) || 0);

export default function SaltDetails({ open, batch, onClose, onEdit }: Props) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !batch) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4" onClick={handleOverlayClick}>
      <div className="bg-[#061421] border border-[#12304a] rounded-xl w-full max-w-lg max-h-[95vh] flex flex-col">

        <div className="flex justify-between items-center border-b border-[#12304a] p-4 sm:p-5 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold">Détails du lot</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto text-sm sm:text-base">
          <p><b>Référence :</b> {batch.batch_reference}</p>
          <p><b>Date de récolte :</b> {formatDate(batch.harvest_date)}</p>
          <p><b>Quantité :</b> {formatNumber(batch.quantity_kg)} Kg</p>
          <p><b>Pureté :</b> {batch.purity_percent}%</p>
          <p><b>Qualité :</b> {QUALITY_LABELS[batch.quality] || batch.quality}</p>
          <p><b>Emballage :</b> {batch.packaging_type || '-'}</p>
          <p><b>Stockage :</b> {batch.storage_location || '-'}</p>
          <p className="break-words"><b>Notes :</b> {batch.notes || '-'}</p>

          <div>
            <b>Statut :</b>{' '}
            <span className={`px-3 py-1 rounded-full text-xs border ${
              batch.sold ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
            }`}>
              {batch.sold ? 'Vendu' : 'Disponible'}
            </span>
          </div>

          {batch.sold && (
            <>
              <p><b>Prix :</b> {formatNumber(batch.price_fcfa)} FCFA</p>
              <p><b>Acheteur :</b> {batch.buyer || '-'}</p>
            </>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-[#12304a] flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#12304a] text-sm w-full sm:w-auto">Fermer</button>
          <button onClick={() => onEdit(batch)} className="px-4 py-2 rounded-lg bg-[#00BFFF] text-black font-medium flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
            <Edit size={16} /> Modifier
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
}