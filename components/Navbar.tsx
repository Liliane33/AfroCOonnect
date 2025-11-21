import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LogOut, User as UserIcon, PlusCircle, Menu, LayoutDashboard, MessageSquare, Users, Search } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (view: string) => void;
  onLoginClick: () => void;
  onLogout: () => void;
  currentView: string;
  onSearch: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentUser, 
  onNavigate, 
  onLoginClick, 
  onLogout,
  currentView,
  onSearch
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  // Placeholder dynamique selon la vue
  const getPlaceholder = () => {
    if (currentView === 'COMMUNITY') return "Rechercher un membre...";
    if (currentView === 'TRANSPORT') return "Rechercher un trajet, une ville...";
    return "Rechercher un service, une ville...";
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer mr-4" onClick={() => onNavigate('HOME')}>
              <span className="text-2xl font-bold text-primary">Afro<span className="text-secondary">Connect</span></span>
            </div>
          </div>

          {/* Search Bar - Visible on Desktop */}
          <div className="hidden md:flex flex-1 items-center justify-center max-w-lg px-4">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-0 rounded-full pl-10 pr-4 py-2 text-sm transition-all duration-300"
              />
              <button type="submit" className="absolute left-0 top-0 mt-2 ml-3 text-gray-400 hover:text-primary">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Desktop Menu Actions */}
          <div className="hidden md:flex items-center space-x-6">
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
              Colis
            </button>
            <button 
              onClick={() => onNavigate('COMMUNITY')}
              className={`text-gray-600 hover:text-primary font-medium flex items-center gap-1 ${currentView === 'COMMUNITY' ? 'text-primary' : ''}`}
            >
              <Users size={18} />
              <span className="hidden lg:inline">Communauté</span>
            </button>
            
            {currentUser && (
              <button 
                onClick={() => onNavigate('MESSAGING')}
                className={`text-gray-600 hover:text-primary font-medium flex items-center gap-1 ${currentView === 'MESSAGING' ? 'text-primary' : ''}`}
                title="Messagerie"
              >
                <MessageSquare size={18} />
              </button>
            )}

            {currentUser && currentUser.role === UserRole.ADMIN && (
               <button 
               onClick={() => onNavigate('ADMIN')}
               className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
             >
               <LayoutDashboard size={18} />
             </button>
            )}

            {currentUser ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => onNavigate('CREATE_AD')}
                  className="bg-primary hover:bg-teal-700 text-white px-4 py-2 rounded-full flex items-center space-x-2 transition shadow-sm"
                >
                  <PlusCircle size={18} />
                  <span>Publier</span>
                </button>
                
                <div className="relative group">
                  <button 
                    onClick={() => onNavigate('PROFILE')}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary focus:outline-none"
                    title="Mon Profil"
                  >
                    <img src={currentUser.avatar} alt="Profile" className="h-8 w-8 rounded-full border border-gray-200 object-cover" />
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 w-48 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg hidden group-hover:block py-1">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    </div>
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
                Connexion
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
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 animate-fade-in-down">
          {/* Mobile Search */}
          <form onSubmit={(e) => { handleSearchSubmit(e); setIsMenuOpen(false); }} className="relative">
             <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </form>

          <button onClick={() => { onNavigate('SERVICES'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-gray-700 py-2">Services</button>
          <button onClick={() => { onNavigate('TRANSPORT'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-gray-700 py-2">Colis & Voyages</button>
          <button onClick={() => { onNavigate('COMMUNITY'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-gray-700 py-2 flex items-center gap-2"><Users size={16} /> Communauté</button>
          
          {currentUser ? (
            <>
               <div className="border-t border-gray-100 pt-4 mt-2">
                 <div className="flex items-center gap-3 mb-4 px-2">
                    <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-bold text-gray-900">{currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.role}</p>
                    </div>
                 </div>
                 <button onClick={() => { onNavigate('MESSAGING'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-gray-700 py-2 flex items-center gap-2">
                  <MessageSquare size={16} /> Messagerie
                </button>
                <button onClick={() => { onNavigate('PROFILE'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-gray-700 py-2">Mon Profil</button>
                <button onClick={() => { onNavigate('CREATE_AD'); setIsMenuOpen(false); }} className="block w-full text-left font-medium text-primary py-2 flex items-center gap-2"><PlusCircle size={16}/> Publier une offre</button>
                <button onClick={onLogout} className="block w-full text-left font-medium text-red-600 py-2 mt-2">Déconnexion</button>
               </div>
            </>
          ) : (
            <div className="pt-4">
               <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="block w-full text-center bg-primary text-white py-3 rounded-xl font-bold shadow-md">Connexion / Inscription</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};