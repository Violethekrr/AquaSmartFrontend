import React, { useEffect, useState } from 'react';
import { 
  ShoppingCart, Package, CheckCircle, Clock, XCircle, 
  Search, Filter, Eye, Truck
} from 'lucide-react';
import api from '../services/api';

interface Order {
  id: number;
  client_name: string;
  client_phone: string;
  water_quantity_liters: number;
  status: string;
  total_amount_fcfa: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  processing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  confirmed: <CheckCircle className="w-4 h-4" />,
  processing: <Package className="w-4 h-4" />,
  delivered: <Truck className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/');
        setOrders(response.data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchSearch = order.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        order.client_phone?.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#055DBF]"></div>
      </div>
    );
  }

  return (
    <div className="">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 sm:absolute top-0 left-0 sm:m-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Commandes</h1>
          <p className="text-gray-400 text-sm mt-1">Suivi des commandes clients</p>
        </div>
        <div className="flex items-center gap-2 bg-[#055DBF]/10 border border-[#055DBF]/30 rounded-lg px-4 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">
            {orders.length} commandes
          </span>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4 mb-6 mt-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/10 border border-[#055DBF]/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#055DBF]/50"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-900/10 border border-[#055DBF]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#055DBF]/50"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmé</option>
            <option value="processing">En traitement</option>
            <option value="delivered">Livré</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-8 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucune commande trouvée</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-900/5 border border-[#055DBF]/20 rounded-xl p-4 hover:border-[#055DBF]/50 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-white font-medium">{order.client_name}</h3>
                  <p className="text-sm text-gray-400">{order.client_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {order.water_quantity_liters} L
                  </p>
                  <p className="text-sm text-[#055DBF]">
                    {order.total_amount_fcfa?.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                    {STATUS_ICONS[order.status]}
                    {order.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {order.payment_status === 'paid' ? 'Payé' : 'Non payé'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}