/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VoworaProvider } from './context/VoworaContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { CreateWizardPage } from './pages/CreateWizardPage';
import { EditorPage } from './pages/EditorPage';
import { PublicInvitationPage } from './pages/PublicInvitationPage';
import { DashboardPage } from './pages/DashboardPage';
import { GuestManagementPage } from './pages/GuestManagementPage';
import { PricingAndAboutPage } from './pages/PricingAndAboutPage';

export default function App() {
  return (
    <VoworaProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#292720]">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/pricing" element={<PricingAndAboutPage mode="pricing" />} />
              <Route path="/about" element={<PricingAndAboutPage mode="about" />} />
              <Route path="/i/:slug" element={<PublicInvitationPage />} />

              {/* Creation, Editor & Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/my-invitations" element={<DashboardPage />} />
              <Route path="/settings" element={<DashboardPage />} />
              <Route path="/account" element={<DashboardPage />} />
              <Route path="/create" element={<CreateWizardPage />} />
              <Route path="/editor/:projectId" element={<EditorPage />} />
              <Route path="/guests/:projectId" element={<GuestManagementPage />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </VoworaProvider>
  );
}
