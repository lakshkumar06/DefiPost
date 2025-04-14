import { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { Web3Provider } from './Web3Context';
import { ProjectProvider } from './ProjectContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <Web3Provider>
      <AuthProvider>
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </AuthProvider>
    </Web3Provider>
  );
}; 