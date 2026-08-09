import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Radar, Droplets, Zap, Bell, Wrench,
  FileText, Beaker, Settings, Users, Menu, X, ShoppingCart
} from 'lucide-react';
import { useAuthStore } from '../../store/authSlice';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin', 'tech', 'operator'] },
  { path: '/sensors', label: 'Capteurs', icon: Radar, roles: ['admin', 'tech', 'operator'] },
  { path: '/water', label: "Qualité de l'eau", icon: Droplets, roles: ['admin', 'tech', 'operator'] },
  { path: '/energy', label: 'Énergie', icon: Zap, roles: ['admin', 'tech'] },
  { path: '/alarms', label: 'Alarmes', icon: Bell, roles: ['admin', 'tech', 'operator'] },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['admin', 'tech'] },
  { path: '/reports', label: 'Rapports', icon: FileText, roles: ['admin', 'tech'] },
  { path: '/orders', label: 'Commandes', icon: ShoppingCart, roles: ['admin'] },
  { path: '/salt', label: 'Gestion du sel', icon: Beaker, roles: ['admin', 'tech', 'operator'] },
  { path: '/config', label: 'Configuration', icon: Settings, roles: ['admin'] },
  { path: '/users', label: 'Utilisateurs', icon: Users, roles: ['admin'] },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  tech: 'Technicien',
  operator: 'Opérateur',
};

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const visibleItems = navItems.filter(item =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <>
      {/* Burger Button - visible uniquement sur mobile */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-3 right-0 z-200 p-2 text-gray-400 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-100
          w-55 text-white flex flex-col
          transition-transform duration-300 ease-in-out
          rounded-xl m-2 overflow-hidden
          border border-[#055DBF]/20 bg-linear-to-b from-gray-900/20 to-[#055DBF]/10 backdrop-blur-lg md:backdrop-blur-xs
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 text-center border-b border-[#055DBF]/20">
          <div className="flex items-center justify-center gap-2">
            <div className="w-22 h-22 absolute left-0 -top-4 rounded-lg flex items-center justify-center">
              <img src='/logoAqua.png' alt='logo' />
            </div>
            <span className="text-xl font-bold text-white ml-20">AquaSmart</span>
          </div>
        </div>

        {/* Navigation filtrée par rôle */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
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

        {/* Footer - infos du vrai utilisateur connecté */}
        <div className="border-t border-[#055DBF]/20 p-4">
          <div className="flex items-center gap-3 px-3 py-2 text-gray-400">
            <div className="w-8 h-8 bg-[#055DBF]/20 rounded-full flex items-center justify-center">
              <Users size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user?.full_name || 'Utilisateur'}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {user?.role ? ROLE_LABELS[user.role] : ''}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 text-center mt-2">v1.0.0</p>
        </div>
      </aside>
    </>
  );
};