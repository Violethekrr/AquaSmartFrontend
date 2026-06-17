import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radar, Droplets, Zap, Bell, Wrench, FileText, Beaker, Settings, Users} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/sensors', label: 'Capteurs', icon: Radar },
  { path: '/water', label: 'Qualité de l\'eau', icon: Droplets },
  { path: '/energy', label: 'Énergie', icon: Zap },
  { path: '/alarms', label: 'Alarmes', icon: Bell },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench },
  { path: '/reports', label: 'Rapports', icon: FileText },
  { path: '/salt', label: 'Gestion du sel', icon: Beaker },
  { path: '/config', label: 'Configuration', icon: Settings },
  { path: '/users', label: 'Utilisateurs', icon: Users },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-55  text-white flex flex-col rounded-xl m-2 border-2 border-[#055DBF]/30 bg-linear-to-r from-[#055DBF]/20 to-[#014EAE]/20 ">
      <div className="p-2 text-2xl font-bold text-center border-b border-gray-700">
        AquaSmart
      </div>
      <nav className="flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition m-2 rounded-lg ${
                  isActive ? 'font-bold bg-linear-to-r from-[#055DBF] to-[#014EAE]' : ''
                }`
              }
            >
              <Icon size={16} className="flex-shrink-0 " />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};