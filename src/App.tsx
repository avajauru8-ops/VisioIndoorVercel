/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminIntegration from './pages/admin/AdminIntegration';
import AdminTotems from './pages/admin/AdminTotems';

import AgencyDashboard from './pages/agency/AgencyDashboard';
import AgencyTotems from './pages/agency/AgencyTotems';
import AgencyPlaylists from './pages/agency/AgencyPlaylists';
import AgencyNews from './pages/agency/AgencyNews';
import AgencyProfile from './pages/agency/AgencyProfile';
import AgencyMediaKit from './pages/agency/AgencyMediaKit';
import AgencyContracts from './pages/agency/AgencyContracts';

import WidgetClima from './pages/widgets/WidgetClima';
import WidgetLoteria from './pages/widgets/WidgetLoteria';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/widget/clima" element={<WidgetClima />} />
          <Route path="/widget/loteria" element={<WidgetLoteria />} />
          
          <Route path="/" element={<Layout />}>
             <Route index element={<Navigate to="/login" replace />} />
             
             {/* Admin Routes */}
             <Route path="admin" element={<AdminDashboard />} />
             <Route path="admin/users" element={<AdminUsers />} />
             <Route path="admin/settings" element={<AdminSettings />} />
             <Route path="admin/integration" element={<AdminIntegration />} />
             <Route path="admin/totems" element={<AdminTotems />} />
             
             {/* Agency Routes */}
             <Route path="agency" element={<AgencyDashboard />} />
             <Route path="agency/totems" element={<AgencyTotems />} />
             <Route path="agency/playlists" element={<AgencyPlaylists />} />
             <Route path="agency/news" element={<AgencyNews />} />
             <Route path="agency/profile" element={<AgencyProfile />} />
             <Route path="agency/media-kit" element={<AgencyMediaKit />} />
             <Route path="agency/contracts" element={<AgencyContracts />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
