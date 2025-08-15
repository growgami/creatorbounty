'use client';

import React, { Suspense } from 'react';
import AdminLanding from '@/features/landing-pages/authenticated/admin/orchestrator/AdminLanding';

/**
 * Admin RBAC Page
 * Renders the admin orchestrator for campaign management
 */
const AdminPage: React.FC = () => {
  return (
    <Suspense>
      <AdminLanding />
    </Suspense>
  );
};

export default AdminPage;
