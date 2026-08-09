import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, KeyRound } from 'lucide-react';

interface Props {
  open: boolean;
  email: string;
  password: string;
  onClose: () => void;
}

export default function GeneratedPasswordModal({ open, email, password, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copie impossible :', err);
    }
  };

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[#061421] border border-[#12304a] rounded-xl w-full max-w-md">

        <div className="flex justify-between items-center border-b border-[#12304a] p-4 sm:p-5">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <KeyRound size={20} className="text-[#00BFFF]" />
            Mot de passe généré
          </h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <p className="text-sm text-gray-400">
            Un mot de passe temporaire a été généré pour <span className="text-white">{email}</span>.
          </p>

          <div className="flex items-center gap-2 bg-[#081b2b] border border-[#12304a] rounded-lg p-3">
            <code className="flex-1 text-[#00BFFF] font-mono text-sm break-all">{password}</code>
            <button
              onClick={handleCopy}
              className="shrink-0 p-2 rounded-lg bg-[#12304a] hover:bg-[#1a4266] transition"
              title="Copier"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>

          <p className="text-xs text-yellow-400/80 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            Ce mot de passe ne sera plus jamais affiché. Communique-le à l'utilisateur maintenant, puis ferme cette fenêtre.
          </p>
        </div>

        <div className="p-4 sm:p-5 border-t border-[#12304a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#00BFFF] text-black font-medium text-sm w-full sm:w-auto"
          >
            J'ai noté le mot de passe
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
}