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
    <aside className="w-55 text-white flex flex-col  rounded-xl m-2 overflow-hidden  border border-[#055DBF]/20 bg-gradient-to-b from-[#055DBF]/20 to-[#014EAE]/10 backdrop-blur-sm">
      <div className="p-4 text-center border-b border-[#055DBF]/20">
        <div className="flex items-center justify-center gap-2">
          <div className="w-22 h-22 absolute left-0 -top-4  rounded-lg flex items-center justify-center">
            <img src='/logoAqua.png' alt='logo' />
          </div>
          <span className="text-xl font-bold text-white ml-20">AquaSmart</span>
        </div>
     
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1 ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#055DBF] to-[#014EAE] text-white shadow-lg shadow-[#055DBF]/25' 
                    : 'text-gray-300 hover:bg-[#055DBF]/20 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#055DBF]/20 p-4">
        <div className="flex items-center gap-3 px-3 py-2 text-gray-400">
          <div className="w-8 h-8 bg-[#055DBF]/20 rounded-full flex items-center justify-center">
            <Users size={16} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-white">Admin</p>
            <p className="text-[10px] text-gray-400">admin@aquasmart.com</p>
          </div>
      
        </div>
        <p className="text-[10px] text-gray-500 text-center mt-2">v1.0.0</p>
      </div>
    </aside>
  );
};