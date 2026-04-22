import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/store/AuthContext';
import AppRouter from '@/route/AppRouter';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;