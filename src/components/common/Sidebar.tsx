import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Tableau de bord', icon: '📊' },
  { path: '/sensors', label: 'Capteurs', icon: '📡' },
  { path: '/water', label: 'Qualité de l\'eau', icon: '💧' },
  { path: '/energy', label: 'Énergie', icon: '⚡' },
  { path: '/alarms', label: 'Alarmes', icon: '🔔' },
  { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
  { path: '/reports', label: 'Rapports', icon: '📄' },
  { path: '/salt', label: 'Gestion du sel', icon: '🧂' },
  { path: '/config', label: 'Configuration', icon: '⚙️' },
  { path: '/users', label: 'Utilisateurs', icon: '👥' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">AquaSmart</div>
      <nav className="flex-1 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition ${
                isActive ? 'bg-gray-700 border-l-4 border-blue-500' : ''
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};