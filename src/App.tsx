import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authSlice';
import {Navbar }from './components/common/Navbar';
import {Sidebar} from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import {Spinner} from './components/common/Spinner';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sensors = lazy(() => import('./pages/Sensors'));
const WaterQuality = lazy(() => import('./pages/WaterQuality'));
const Energy = lazy(() => import('./pages/Energy'));
const Alarms = lazy(() => import('./pages/Alarms'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Reports = lazy(() => import('./pages/Reports'));
const SaltManagement = lazy(() => import('./pages/SaltManagement'));
const SystemConfig = lazy(() => import('./pages/SystemConfig'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const { token } = useAuthStore();
  const isAuthenticated = !!token;

  return (
    <div className="flex h-screen bg-black text-xs lg:text-sm bg-center bg-cover" style={{fontFamily: 'inherit', backgroundImage: 'url("/2.jpg")',}}>
      { isAuthenticated && <Sidebar />}
      <div className={`flex-1 flex flex-col overflow-hidden border-2 border-[#055DBF]/30 m-2 rounded-xl bg-linear-to-b from-[#055DBF]/10 via-[#014EAE]/15 to-[#003D7E]/20`}>
        { isAuthenticated && <Navbar />}
        <main className="flex-1 overflow-y-auto p-4 ">
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sensors" element={<Sensors />} />
                <Route path="/water" element={<WaterQuality />} />
                <Route path="/energy" element={<Energy />} />
                <Route path="/alarms" element={<Alarms />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/salt" element={<SaltManagement />} />
                <Route path="/config" element={<SystemConfig />} />
                <Route path="/users" element={<UserManagement />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;