import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ProgramPage } from './pages/ProgramPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AdminPage } from './pages/AdminPage';

type Page = 'home' | 'program' | 'favorites' | 'admin';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const { loading, profile } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    if (page !== 'program') {
      setSelectedProgramId(null);
    }
  };

  const handleSelectProgram = (programId: string) => {
    setSelectedProgramId(programId);
    setCurrentPage('program');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />

      {currentPage === 'home' && <HomePage onSelectProgram={handleSelectProgram} />}

      {currentPage === 'program' && selectedProgramId && (
        <ProgramPage
          programId={selectedProgramId}
          onBack={() => handleNavigate('home')}
        />
      )}

      {currentPage === 'favorites' && (
        <FavoritesPage onSelectProgram={handleSelectProgram} />
      )}

      {currentPage === 'admin' && profile?.is_admin && <AdminPage />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
