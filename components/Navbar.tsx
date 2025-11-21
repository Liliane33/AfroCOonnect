import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, User as UserIcon, PlusCircle, Menu, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (view: string) => void;
  onLoginClick: () => void;
  onLogout: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentUser, 
  onNavigate, 
  onLoginClick, 
  onLogout,
  currentView
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('HOME')}>
            <span className="text-2xl font-bold text-primary">Afro<span className="text-secondary">Connect</span></span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate('SERVICES')}
              className={`text-gray-600 hover:text-primary font-medium ${currentView === 'SERVICES' ? 'text-primary' : ''}`}
            >
              Services
            </button>
            <button 
              onClick={() => onNavigate('TRANSPORT')}
              className={`text-gray-600 hover:text-primary font-medium ${currentView === 'TRANSPORT' ? 'text-primary' : ''}`}
            >
              Colis & Voyages
            </button>
            
            {currentUser && currentUser.role === UserRole.ADMIN && (
               <button 
               onClick={() => onNavigate('ADMIN')}
               className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
             >
               <LayoutDashboard size={18} /> Admin
             </button>
            )}

            {currentUser ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => onNavigate('CREATE_AD')}
                  className="bg-primary hover:bg-teal-700 text-white px-4 py-2 rounded-full flex items-center space-x-2 transition"
                >
                  <PlusCircle size={18} />
                  <span>Publier</span>
                </button>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary">
                    <img src={currentUser.avatar} alt="Profile" className="h-8 w-8 rounded-full border border-gray-200" />
                    <span className="font-medium">{currentUser.name}</span>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 w-48 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg hidden group-hover:block py-1">
                    <button onClick={() => onNavigate('PROFILE')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Mon Profil</button>
                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={14} /> Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="text-primary border border-primary px-4 py-2 rounded-full hover:bg-primary/5 transition font-medium"
              >
                Connexion / Inscription
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4">
          <button onClick={() => { onNavigate('SERVICES'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-gray-700">Services</button>
          <button onClick={() => { onNavigate('TRANSPORT'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-gray-700">Colis & Voyages</button>
          {currentUser ? (
            <>
              <button onClick={() => { onNavigate('CREATE_AD'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-primary">Publier une annonce</button>
              <button onClick={() => { onNavigate('PROFILE'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-gray-700">Mon Profil</button>
              <button onClick={onLogout} className="block w-full text-left font-medium text-red-600">Déconnexion</button>
            </>
          ) : (
            <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="block w-full text-center bg-primary text-white py-2 rounded-lg">Connexion</button>
          )}
        </div>
      )}
    </nav>
  );
};
