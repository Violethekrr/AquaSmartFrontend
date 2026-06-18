// ============================================
// FICHIER : Navbar.tsx
// ============================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { Notifications } from './Notifications';
import api from '../../services/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Récupérer le nombre de notifications non lues
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/notifications/?read=false');
        setUnreadCount(response.data.length);
      } catch (err) {
        console.error('Erreur:', err);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Récupérer les notifications quand le popup s'ouvre
  useEffect(() => {
    if (showNotif) {
      api.get('/notifications/?ordering=-created_at&limit=5')
        .then(res => setNotifications(res.data))
        .catch(err => console.error(err));
    }
  }, [showNotif]);

  // Marquer une notification comme lue
  const handleMarkRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/mark_read/`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  // Marquer toutes les notifications comme lues
  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full py-3 px-6 flex justify-between items-center relative">
      <h1 className="text-xl font-bold text-[#00BFFF]"></h1>

      <div className="flex items-center gap-5">
        {/* Bouton notification */}
        <div className="relative">
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className="relative text-gray-400 hover:text-[#00BFFF] transition"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Popup */}
          <Notifications
            isOpen={showNotif} 
            onClose={() => setShowNotif(false)} 
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
          />
        </div>

        <span className="hidden lg:block text-gray-300 text-sm">{user?.email}</span>

        <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition">
          <LogOut size={22} />
        </button>
      </div>
    </nav>
  );
};