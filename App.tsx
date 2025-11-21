import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdCard } from './components/AdCard';
import { CreateAd } from './components/CreateAd';
import { PaymentModal } from './components/PaymentModal';
import { Ad, AdCategory, User, UserRole, ServiceType } from './types';
import { MOCK_ADS, MOCK_USERS } from './constants';
import { 
  Search, MapPin, Filter, MessageCircle, AlertCircle, 
  Sparkles, Wrench, Scissors, Flower2, GraduationCap, 
  Plane, Package, LayoutGrid, X
} from 'lucide-react';

// Définition des catégories pour l'affichage
const SERVICE_CATEGORIES = [
  { id: 'cleaning', label: 'Ménage', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50', filterTag: ServiceType.CLEANING, targetView: 'SERVICES' },
  { id: 'plumbing', label: 'Plomberie', icon: Wrench, color: 'text-slate-500', bg: 'bg-slate-50', filterTag: ServiceType.PLUMBING, targetView: 'SERVICES' },
  { id: 'hair', label: 'Coiffure', icon: Scissors, color: 'text-pink-500', bg: 'bg-pink-50', filterTag: ServiceType.HAIRDRESSING, targetView: 'SERVICES' },
  { id: 'garden', label: 'Jardinage', icon: Flower2, color: 'text-green-500', bg: 'bg-green-50', filterTag: ServiceType.GARDENING, targetView: 'SERVICES' },
  { id: 'school', label: 'Soutien', icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-50', filterTag: ServiceType.TUTORING, targetView: 'SERVICES' },
  { id: 'transport', label: 'Colis & Voyage', icon: Plane, color: 'text-orange-500', bg: 'bg-orange-50', filterTag: null, targetView: 'TRANSPORT' },
];

const App: React.FC = () => {
  // App State
  const [view, setView] = useState('HOME'); // HOME, SERVICES, TRANSPORT, CREATE_AD, ADMIN, PROFILE
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ads, setAds] = useState<Ad[]>(MOCK_ADS);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  // Modal State
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAdForPayment, setSelectedAdForPayment] = useState<Ad | null>(null);

  // Derived Data
  const filteredAds = ads.filter(ad => {
    // 1. Search & Location
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || ad.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    // 2. Category View Filter
    let matchesView = true;
    if (view === 'SERVICES') matchesView = ad.category === AdCategory.SERVICE;
    if (view === 'TRANSPORT') matchesView = ad.category === AdCategory.TRANSPORT;

    // 3. Specific Tag Filter (clicked from categories)
    const matchesTag = activeTagFilter ? ad.tags.includes(activeTagFilter) : true;

    return matchesSearch && matchesLocation && matchesView && matchesTag;
  });

  // Handlers
  const handleLogin = () => {
    setCurrentUser(MOCK_USERS[0]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('HOME');
  };

  const handleCreateAd = (newAd: Ad) => {
    setAds([newAd, ...ads]);
    setView('SERVICES'); 
  };

  const handleAdClick = (ad: Ad) => {
    if (!currentUser) {
      alert("Veuillez vous connecter pour voir les détails.");
      return;
    }
    setSelectedAdForPayment(ad);
    setShowPayment(true);
  };

  const handleDeleteAd = (id: string) => {
    setAds(ads.filter(a => a.id !== id));
  };

  const handleCategoryClick = (category: typeof SERVICE_CATEGORIES[0]) => {
    setView(category.targetView);
    setActiveTagFilter(category.filterTag);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (newView: string) => {
    setView(newView);
    // Reset tag filter when navigating via main menu unless creating an ad
    if (newView !== 'CREATE_AD') {
      setActiveTagFilter(null);
    }
  };

  // Render Views
  const renderContent = () => {
    if (view === 'CREATE_AD') {
      if (!currentUser) return <div className="p-10 text-center">Veuillez vous connecter.</div>;
      return (
        <CreateAd 
          currentUser={currentUser} 
          onSubmit={handleCreateAd} 
          onCancel={() => setView('HOME')} 
        />
      );
    }

    if (view === 'ADMIN') {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
          return <div className="p-10 text-center text-red-500">Accès refusé.</div>;
      }
      return (
        <div className="max-w-6xl mx-auto py-10 px-4">
           <h2 className="text-3xl font-bold mb-6">Tableau de bord Administrateur</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 text-sm">Utilisateurs Total</h3>
                  <p className="text-3xl font-bold">{MOCK_USERS.length + 120}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 text-sm">Annonces Actives</h3>
                  <p className="text-3xl font-bold text-primary">{ads.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 text-sm">Commissions (Mois)</h3>
                  <p className="text-3xl font-bold text-green-600">450,000 XOF</p>
              </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-medium text-gray-600">Annonce</th>
                    <th className="p-4 font-medium text-gray-600">Auteur</th>
                    <th className="p-4 font-medium text-gray-600">Status</th>
                    <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map(ad => (
                    <tr key={ad.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4 font-medium">{ad.title}</td>
                      <td className="p-4 text-gray-500">{ad.authorName}</td>
                      <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">{ad.status}</span></td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteAd(ad.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      );
    }

    if (view === 'PROFILE') {
        if (!currentUser) return null;
        return (
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center space-x-6">
                    <img src={currentUser.avatar} className="w-24 h-24 rounded-full border-4 border-primary/10" alt="" />
                    <div>
                        <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                        <p className="text-gray-500">{currentUser.role}</p>
                        <div className="mt-2 flex items-center space-x-4">
                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">Solde: {currentUser.walletBalance} XOF</span>
                        </div>
                    </div>
                </div>
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Mes activités récentes</h3>
                    <div className="bg-white p-8 rounded-xl text-center text-gray-400">
                        Aucune activité récente.
                    </div>
                </div>
            </div>
        )
    }

    // Views: HOME, SERVICES, TRANSPORT
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section for Home */}
        {view === 'HOME' && (
          <>
            <div className="mb-12 bg-gradient-to-r from-primary to-teal-800 rounded-3xl p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Trouvez le service idéal ou envoyez vos colis.</h1>
                <p className="text-xl opacity-90 mb-8">AfroConnect simplifie vos besoins quotidiens et vos échanges internationaux.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => handleNavigate('SERVICES')} className="bg-secondary hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition">Trouver un prestataire</button>
                  <button onClick={() => handleNavigate('TRANSPORT')} className="bg-white/10 backdrop-blur hover:bg-white/20 border border-white/30 px-8 py-4 rounded-xl font-bold text-lg transition">Envoyer un colis</button>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                  <svg width="600" height="600" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.3C93.5,8.6,82,21.5,70.8,32.4C59.6,43.3,48.7,52.2,36.9,60.8C25.1,69.4,12.5,77.7,-1.2,79.8C-14.9,81.9,-29.8,77.8,-42.6,70.1C-55.4,62.4,-66.1,51.1,-74.1,38.3C-82.1,25.5,-87.4,11.2,-85.7,-2.4C-84,-16,-75.3,-28.9,-65.1,-39.5C-54.9,-50.1,-43.2,-58.4,-31.2,-66.8C-19.2,-75.2,-6.9,-83.7,4.2,-90.9L15.3,-98.1L44.7,-76.4Z" transform="translate(100 100)" />
                  </svg>
              </div>
            </div>

            {/* SERVICES CATEGORIES GRID */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <LayoutGrid className="text-primary" size={24} />
                Explorer par catégorie
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className={`w-14 h-14 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <cat.icon size={28} />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-primary">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Search & Filters */}
        {(view === 'SERVICES' || view === 'TRANSPORT') && (
            <div className="mb-8 space-y-4">
              <div className="md:flex md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <div className="flex-grow relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                    type="text" 
                    placeholder={view === 'SERVICES' ? "Rechercher un plombier, coiffeur..." : "Rechercher un trajet..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div className="relative md:w-1/3">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                    type="text" 
                    placeholder="Ville (ex: Abidjan)"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-600">
                    <Filter size={20} />
                </button>
              </div>
              
              {/* Active Filter Badge */}
              {activeTagFilter && (
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500 mr-2">Filtre actif:</span>
                  <button 
                    onClick={() => setActiveTagFilter(null)}
                    className="flex items-center bg-primary text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-teal-700 transition"
                  >
                    {activeTagFilter}
                    <X size={14} className="ml-1" />
                  </button>
                </div>
              )}
            </div>
        )}

        {/* Content Grid */}
        {view !== 'HOME' && (
            <>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {view === 'SERVICES' ? 'Services disponibles' : 'Prochains départs'}
                </h2>
                
                {filteredAds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAds.map(ad => (
                            <AdCard key={ad.id} ad={ad} onClick={() => handleAdClick(ad)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                            <Search size={40} />
                        </div>
                        <p className="text-lg">Aucune annonce trouvée pour ces critères.</p>
                        {activeTagFilter && (
                          <button onClick={() => setActiveTagFilter(null)} className="mt-4 text-primary font-medium hover:underline">
                            Voir toutes les annonces
                          </button>
                        )}
                    </div>
                )}
            </>
        )}
        
        {/* Recent Ads for Home */}
        {view === 'HOME' && (
            <div>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Récemment ajoutés</h2>
                    <button onClick={() => handleNavigate('SERVICES')} className="text-primary font-semibold hover:underline">Voir tout</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ads.slice(0, 4).map(ad => (
                        <AdCard key={ad.id} ad={ad} onClick={() => handleAdClick(ad)} />
                    ))}
                </div>
            </div>
        )}

      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar 
        currentUser={currentUser} 
        onNavigate={handleNavigate} 
        onLoginClick={handleLogin} 
        onLogout={handleLogout}
        currentView={view}
      />
      
      <main className="flex-grow">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; 2023 AfroConnect. Tous droits réservés.</p>
        </div>
      </footer>

      <PaymentModal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)}
        amount={selectedAdForPayment?.price || 0}
        recipientName={selectedAdForPayment?.authorName || ''}
        onSuccess={() => alert("Paiement reçu ! Vous pouvez maintenant contacter le prestataire.")}
      />
    </div>
  );
};

export default App;