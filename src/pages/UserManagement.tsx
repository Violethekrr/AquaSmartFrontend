import { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, Mail, Search, User, CheckCircle, XCircle, Trash2, Eye, Pencil } from 'lucide-react';
import api from '../services/api';
import UserModal from '../Users/UserModal';
import UserDetails from '../Users/UserDetails';
import GeneratedPasswordModal from '../Users/GeneratedPasswordModal';

interface UserType {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}


const ROLE_LABELS: Record<string, string> = { admin: 'Administrateur', tech: 'Technicien', operator: 'Opérateur' };

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  tech: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  operator: 'bg-green-500/15 text-green-400 border-green-500/30',
};

const EMPTY_FORM = { full_name: '', email: '', password: '', role: 'operator', is_active: true };

const PAGE_SIZE = 8;

export default function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsUser, setDetailsUser] = useState<UserType | null>(null);

  const [generatedPasswordOpen, setGeneratedPasswordOpen] = useState(false);
const [generatedPasswordInfo, setGeneratedPasswordInfo] = useState<{ email: string; password: string } | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    let result = [...users];
    if (filterRole !== 'all') result = result.filter(u => u.role === filterRole);
    if (filterStatus !== 'all') result = result.filter(u => u.is_active === (filterStatus === 'active'));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.email.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q)
      );
    }
    setFilteredUsers(result);
    setPage(1);
  }, [users, search, filterRole, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: name === 'is_active' ? value === 'true' : value,
    }));
  };

  const openCreateModal = () => {
    setEditMode(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (user: UserType) => {
    setEditMode(true);
    setEditId(user.id);
    setForm({
      full_name: user.full_name,
      email: user.email,
      password: '',
      role: user.role,
      is_active: user.is_active,
    });
    setDetailsOpen(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

 const saveUser = async () => {
    try {
      const payload: any = {
        full_name: form.full_name,
        email: form.email,
        role: form.role,
        is_active: form.is_active,
      };

      if (form.password) {
        payload.password = form.password;
      }

      let response;
      if (editMode && editId !== null) {
        response = await api.put(`/users/${editId}/`, payload);
      } else {
        response = await api.post('/users/', payload);
      }

      closeModal();
      loadUsers();

      // Si un mot de passe a été généré automatiquement (création sans mot de passe saisi)
      if (response.data.generated_password) {
        setGeneratedPasswordInfo({
          email: response.data.email,
          password: response.data.generated_password,
        });
        setGeneratedPasswordOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/users/${id}/`);
      loadUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const openDetails = (user: UserType) => {
    setDetailsUser(user);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#055DBF]" />
      </div>
    );
  }

  return (
    <div className="h-full text-white p-4 md:p-6">

      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-gray-400 text-sm">Gestion des comptes et permissions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#00BFFF] text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
        >
          <UserPlus size={18} /> Nouvel utilisateur
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <div className="border border-[#12304a] rounded-xl p-4">
          <Users className="text-[#00BFFF] mb-2" size={20} />
          <p className="text-gray-400 text-xs">Total</p>
          <h2 className="text-2xl font-bold">{users.length}</h2>
        </div>
        <div className="border border-[#12304a] rounded-xl p-4">
          <Shield className="text-purple-400 mb-2" size={20} />
          <p className="text-gray-400 text-xs">Admins</p>
          <h2 className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</h2>
        </div>
        <div className="border border-[#12304a] rounded-xl p-4">
          <User className="text-blue-400 mb-2" size={20} />
          <p className="text-gray-400 text-xs">Techniciens</p>
          <h2 className="text-2xl font-bold">{users.filter(u => u.role === 'tech').length}</h2>
        </div>
        <div className="border border-[#12304a] rounded-xl p-4">
          <User className="text-green-400 mb-2" size={20} />
          <p className="text-gray-400 text-xs">Opérateurs</p>
          <h2 className="text-2xl font-bold">{users.filter(u => u.role === 'operator').length}</h2>
        </div>
        <div className="border border-[#12304a] rounded-xl p-4">
          <CheckCircle className="text-green-400 mb-2" size={20} />
          <p className="text-gray-400 text-xs">Actifs</p>
          <h2 className="text-2xl font-bold">{users.filter(u => u.is_active).length}</h2>
        </div>
        <div className="border border-[#12304a] rounded-xl p-4">
          <XCircle className="text-red-400 mb-2" size={20} />
          <p className="text-gray-400 text-xs">Inactifs</p>
          <h2 className="text-2xl font-bold">{users.filter(u => !u.is_active).length}</h2>
        </div>
      </div>

      <div className="border border-[#12304a] rounded-xl p-4 mb-5 flex flex-col lg:flex-row gap-4">
        <div className="flex items-center gap-2 border border-[#12304a] rounded-lg px-3 flex-1">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher utilisateur..."
            className="bg-transparent outline-none w-full py-2 text-sm"
          />
        </div>

        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="bg-gray-800 border border-[#12304a] rounded-lg px-3 py-2 text-sm">
          <option value="all">Tous les rôles</option>
          <option value="admin">Administrateur</option>
          <option value="tech">Technicien</option>
          <option value="operator">Opérateur</option>
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-gray-800 border border-[#12304a] rounded-lg px-3 py-2 text-sm">
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
      </div>

      <div className="border border-[#12304a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#081b2b]">
              <tr>
                <th className="p-4 text-left">Utilisateur</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Rôle</th>
                <th className="p-4 text-left">Statut</th>
                <th className="p-4 text-left">Créé le</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Aucun utilisateur trouvé</td></tr>
              )}
              {paginatedUsers.map(user => (
                <tr
                  key={user.id}
                  onClick={() => openDetails(user)}
                  className="border-t border-[#12304a] hover:bg-[#0b2235] cursor-pointer"
                >
                  <td className="p-4 flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-full bg-[#12304a] flex items-center justify-center shrink-0">
                      <User size={18} />
                    </div>
                    {user.full_name}
                  </td>
                  <td className="p-4"><Mail size={15} className="inline mr-2" />{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full border text-xs ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.is_active
                      ? <span className="text-green-400">Actif</span>
                      : <span className="text-red-400">Inactif</span>}
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openDetails(user)}><Eye size={18} className="text-cyan-400" /></button>
                      <button onClick={() => openEditModal(user)}><Pencil size={18} className="text-yellow-400" /></button>
                      <button onClick={() => deleteUser(user.id)}><Trash2 size={18} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-[#12304a] text-sm">
            <span className="text-gray-400">
              Page {page} sur {totalPages} ({filteredUsers.length} utilisateurs)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-[#12304a] disabled:opacity-40"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border border-[#12304a] disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <UserModal
        open={modalOpen}
        editMode={editMode}
        form={form}
        onClose={closeModal}
        onChange={handleFormChange}
        onSubmit={saveUser}
      />

      <UserDetails
        open={detailsOpen}
        user={detailsUser}
        onClose={() => setDetailsOpen(false)}
        onEdit={openEditModal}
      />

      <GeneratedPasswordModal
        open={generatedPasswordOpen}
        email={generatedPasswordInfo?.email || ''}
        password={generatedPasswordInfo?.password || ''}
        onClose={() => setGeneratedPasswordOpen(false)}
      />

    </div>
  );
}