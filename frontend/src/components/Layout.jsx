import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { toggleMute } from '../utils/audio';

const Layout = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const location = useLocation();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleAudio = () => {
    const nowMuted = toggleMute();
    setAudioMuted(nowMuted);
  };

  const navItems = [
    { path: '/mapa',  label: 'Mapa',    icon: '🗺️' },
    { path: '/vault', label: 'Ranking', icon: '⭐' },
    { path: '/admin', label: 'Gestión', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-lg">✝️</span>
              <span className="font-display text-2xl text-camp-dorado tracking-widest">
                CAMP BELLO
              </span>
            </Link>
            <div className="flex items-center space-x-2">
              {window.__campAudio && (
                <button
                  onClick={toggleAudio}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg"
                  aria-label="Toggle audio"
                >
                  {audioMuted ? '🔇' : '🔊'}
                </button>
              )}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors font-military text-base tracking-wide ${
                  location.pathname === item.path
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Page Content */}
        <main className="animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 