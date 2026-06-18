
import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, Mail, Calendar, Search, X, User, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  tech: 'Technicien',
  operator: 'Opérateur',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  tech: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  operator: 'bg-green-500/15 text-green-400 border-green-500/30',
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/');
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];
    if (filterRole !== 'all') {
      result = result.filter(u => u.role === filterRole);
    }
    if (filterActive !== 'all') {
      result = result.filter(u => u.is_active === (filterActive === 'active'));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(u => 
        u.email.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q)
      );
    }
    setFilteredUsers(result);
  }, [users, filterRole, filterActive, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#055DBF]" />
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex flex-col sm:absolute top-0 left-0 sm:m-4">
            <h1 className="text-2xl font-bold mb-2 text-white">Gestion des utilisateurs</h1>
            <p className="text-gray-400 text-sm mb-6">Ajout, suppression, rôles (admin seulement)</p>
      </div>


    
    </div>
  );
}