import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SalonProvider } from './context/SalonContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { JoinQueue } from './pages/JoinQueue';
import { MyStatus } from './pages/MyStatus';
import { Reception } from './pages/Reception';
import { BarberView } from './pages/BarberView';
import { TvDisplay } from './pages/TvDisplay';
import { Admin } from './pages/Admin';

export const App: React.FC = () => {
  return (
    <SalonProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-charcoal-950 text-gray-100 flex flex-col font-sans selection:bg-gold-500 selection:text-charcoal-950">
          <Navbar />
          <main className="flex-1 pb-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/join" element={<JoinQueue />} />
              <Route path="/status/:id" element={<MyStatus />} />
              <Route path="/reception" element={<Reception />} />
              <Route path="/barber" element={<Navigate to="/barber/ravi" replace />} />
              <Route path="/barber/:name" element={<BarberView />} />
              <Route path="/display" element={<TvDisplay />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SalonProvider>
  );
};

export default App;
