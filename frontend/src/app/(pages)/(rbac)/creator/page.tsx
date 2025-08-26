'use client';

import React, { Suspense } from 'react';
import CreatorLanding from '@/features/bounty/creators/orchestrator/landing/CreatorLanding';

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
