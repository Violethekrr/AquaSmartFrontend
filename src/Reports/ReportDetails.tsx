import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Edit, Droplets, Gauge, FlaskConical, Package,
  Zap, Wallet, StickyNote
} from 'lucide-react';

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

interface Props {
  open: boolean;
  report: ProductionReport | null;
  onClose: () => void;
  onEdit: (report: ProductionReport) => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
};

const formatNumber = (n: number | null | undefined) => {
  if (n === null || n === undefined) return '-';
  return new Intl.NumberFormat('fr-FR').format(n);
};

const StatBlock = ({ icon, iconColor, label, value }: any) => (
  <div className="border border-[#12304a] rounded-lg p-3 flex items-center gap-3">
    <div className={`p-2 bg-[#055DBF]/10 ${iconColor} rounded-lg shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  </div>
);

export default function ReportDetails({ open, report, onClose, onEdit }: Props) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !report) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const profit = (report.total_revenue_fcfa || 0) - (report.total_expenses_fcfa || 0);
  const netEnergy = (report.energy_produced_kwh || 0) - (report.energy_used_kwh || 0);

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#061421] border border-[#12304a] rounded-xl w-full max-w-2xl max-h-[95vh] flex flex-col">

        <div className="flex justify-between items-center border-b border-[#12304a] p-4 sm:p-5 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold">Rapport du {formatDate(report.report_date)}</h2>
          <button onClick={onClose} className="shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">

          {/* PRODUCTION */}
          <div>
            <h3 className="text-sm font-semibold text-[#00BFFF] mb-3">Production d'eau</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StatBlock icon={<Droplets size={18} className="text-blue-400" />} label="Eau produite" value={`${formatNumber(report.water_produced_liters / 1000)} m³`} />
              <StatBlock icon={<Droplets size={18} className="text-cyan-300" />} label="Eau distribuée" value={`${formatNumber(report.water_distributed_liters / 1000)} m³`} />
            </div>
          </div>

          {/* ÉNERGIE */}
          <div>
            <h3 className="text-sm font-semibold text-[#00BFFF] mb-3">Énergie</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StatBlock icon={<Zap size={18} className="text-yellow-400" />} label="Énergie utilisée" value={`${formatNumber(report.energy_used_kwh)} kWh`} />
              <StatBlock icon={<Zap size={18} className="text-green-400" />} label="Énergie produite" value={`${formatNumber(report.energy_produced_kwh)} kWh`} />
            </div>
            <p className={`text-xs mt-2 ${netEnergy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              Bilan énergétique net : {netEnergy >= 0 ? '+' : ''}{formatNumber(netEnergy)} kWh
            </p>
          </div>

          {/* QUALITÉ DE L'EAU */}
          <div>
            <h3 className="text-sm font-semibold text-[#00BFFF] mb-3">Qualité de l'eau</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StatBlock icon={<Gauge size={18} className="text-cyan-400" />} label="Salinité entrée" value={`${formatNumber(report.avg_salinity_in_ppm)} ppm`} />
              <StatBlock icon={<Gauge size={18} className="text-cyan-400" />} label="Salinité sortie" value={`${formatNumber(report.avg_salinity_out_ppm)} ppm`} />
              <StatBlock icon={<FlaskConical size={18} className="text-orange-400" />} label="pH moyen" value={report.avg_pH ?? '-'} />
              <StatBlock icon={<Gauge size={18} className="text-purple-400" />} label="Pression moyenne" value={`${formatNumber(report.avg_pressure_bar)} bar`} />
            </div>
          </div>

          {/* SEL & FINANCES */}
          <div>
            <h3 className="text-sm font-semibold text-[#00BFFF] mb-3">Sel & Finances</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StatBlock icon={<Package size={18} className="text-green-400" />} label="Sel collecté" value={`${formatNumber(report.salt_collected_kg)} kg`} />
              <StatBlock icon={<Wallet size={18} className="text-blue-400" />} label="Revenu total" value={`${formatNumber(report.total_revenue_fcfa)} FCFA`} />
              <StatBlock icon={<Wallet size={18} className="text-red-400" />} label="Dépenses totales" value={`${formatNumber(report.total_expenses_fcfa)} FCFA`} />
              <StatBlock
                icon={<Wallet size={18} className={profit >= 0 ? 'text-green-400' : 'text-red-400'} />}
                label="Bénéfice net"
                value={<span className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>{formatNumber(profit)} FCFA</span>}
              />
            </div>
          </div>

          {/* NOTES */}
          {report.notes && (
            <div>
              <h3 className="text-sm font-semibold text-[#00BFFF] mb-3 flex items-center gap-2">
                <StickyNote size={16} /> Notes
              </h3>
              <p className="text-sm text-gray-300 border border-[#12304a] rounded-lg p-3 break-words">
                {report.notes}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-[#12304a] flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#12304a] text-sm w-full sm:w-auto">
            Fermer
          </button>
          <button onClick={() => onEdit(report)} className="px-4 py-2 rounded-lg bg-[#00BFFF] text-black font-medium flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
            <Edit size={16} /> Modifier
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
}