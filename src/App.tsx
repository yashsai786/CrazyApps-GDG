import React from 'react';
import { useRouter } from './hooks/useRouter';
import { LandingPage } from './pages/LandingPage';
import { AbsentExperience } from './pages/AbsentExperience';
import { GhostExperience } from './pages/GhostExperience';

export const App: React.FC = () => {
  const { currentPath, navigate } = useRouter();

  if (currentPath === '/useful') {
    return <AbsentExperience onBack={() => navigate('/')} />;
  }

  if (currentPath === '/not-useful') {
    return <GhostExperience onBack={() => navigate('/')} />;
  }

  return (
    <LandingPage
      onSelectUseful={() => navigate('/useful')}
      onSelectNotUseful={() => navigate('/not-useful')}
    />
  );
};

export default App;
