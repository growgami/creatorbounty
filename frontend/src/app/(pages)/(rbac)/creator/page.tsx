'use client';

import React, { Suspense } from 'react';
import CreatorLanding from '@/features/landing-pages/authenticated/creator/orchestrator/CreatorLanding';

/**
 * Creator RBAC Page
 * Renders the creator orchestrator for bounty participation
 */
const CreatorPage: React.FC = () => {
  return (
    <Suspense>
      <CreatorLanding />
    </Suspense>
  );
};

export default CreatorPage;
