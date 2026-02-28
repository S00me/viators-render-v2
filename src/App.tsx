/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AdminProvider } from '@/context/AdminContext';
import Home from '@/pages/Home';
import Itinerary from '@/pages/Itinerary';
import { useEffect } from 'react';

function ScrollToTopOnMount() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable browser scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  useEffect(() => {
    // Set document title
    document.title = "viators.hu";

    // Fetch profile picture for favicon
    fetch('/api/settings/profile_picture')
      .then(res => res.json())
      .then(data => {
        if (data.value) {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (link) {
            link.href = data.value;
          } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = data.value;
            document.head.appendChild(newLink);
          }
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/itinerary" element={<Itinerary />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <Router>
        <ScrollToTopOnMount />
        <AppContent />
      </Router>
    </AdminProvider>
  );
}

