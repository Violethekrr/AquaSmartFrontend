// ============================================
// FICHIER : components/common/NotificationPopup.tsx
// ============================================

import React from 'react';
import { Bell, X, Clock, AlertCircle, AlertTriangle, CheckCircle, Info, CheckCheck } from 'lucide-react';
import api from '../../services/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
}

export const Notifications: React.FC<NotificationPopupProps> = ({ 
  isOpen, 
  onClose, 
  notifications,
  onMarkRead,
  onMarkAllRead
}) => {
  const getIcon = (type: string) => {
    switch(type) {
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getBg = (type: string) => {
    switch(type) {
      case 'alert': return 'border-red-500/20 bg-red-500/5';
      case 'warning': return 'border-yellow-500/20 bg-yellow-500/5';
      case 'success': return 'border-green-500/20 bg-green-500/5';
      default: return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="absolute -left-28 top-full mt-3 w-80 bg-gray-900 border border-[#055DBF]/30 rounded-xl shadow-2xl overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#055DBF]/20">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#055DBF]" />
          <span className="text-sm font-semibold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#055DBF] hover:text-[#00BFFF] transition flex items-center gap-1"
            >
              <CheckCheck size={12} />
              Tout lire
            </button>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="max-h-80 overflow-y-auto p-2 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">Aucune notification</div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`flex items-start gap-3 p-3 rounded-lg border ${getBg(n.type)} ${!n.read ? 'border-l-4 border-l-[#055DBF]' : 'opacity-70'}`}
            >
              {getIcon(n.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  {!n.read && (
                    <button
                      onClick={() => onMarkRead(n.id)}
                      className="text-[10px] text-blue-400 hover:text-blue-300 transition flex-shrink-0 ml-2"
                    >
                      Marquer lu
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-gray-500 mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          ))
        )}
      </div>

  
    </div>
  );
};