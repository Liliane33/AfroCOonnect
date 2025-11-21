import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdCard } from './components/AdCard';
import { AdDetails } from './components/AdDetails';
import { CreateAd } from './components/CreateAd';
import { PaymentModal } from './components/PaymentModal';
import { AuthModal } from './components/AuthModal';
import { ChatWindow } from './components/ChatWindow';
import { Ad, AdCategory, User, UserRole, ServiceType, Message } from './types';
import { MOCK_ADS, MOCK_USERS, MOCK_MESSAGES } from './constants';
import { 
  Search, MapPin, Filter, AlertCircle, 
  Sparkles, Wrench, Scissors, Flower2, GraduationCap, 
  Plane, LayoutGrid, X, PlusCircle, Plus, Users, Star, Mail,
  Settings, Wallet, LogOut, Trash2, Phone, LayoutDashboard
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
  const [view, setView] = useState('HOME'); // HOME, SERVICES, TRANSPORT, AD_DETAILS, CREATE_AD, ADMIN, PROFILE, MESSAGING, COMMUNITY
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ads, setAds] = useState<Ad[]>(MOCK_ADS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  
  // Selected Ad State for Details View
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  
  // User Search State (for Community view)
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Messaging State
  const [initialChatContactId, setInitialChatContactId] = useState<string | undefined>(undefined);

  // Modal State
  const [showPayment, setShowPayment] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adToPay, setAdToPay] = useState<Ad | null>(null);

  // Derived Data
  const filteredAds = ads.filter(ad => {
    // 1. Search & Location
    // Amélioration: La recherche inclut maintenant le titre, la description ET la localisation
    const term = searchTerm.toLowerCase();
    const matchesSearch = ad.title.toLowerCase().includes(term) || 
                          ad.description.toLowerCase().includes(term) ||
                          ad.location.toLowerCase().includes(term) ||
                          (ad.locationTo && ad.locationTo.toLowerCase().includes(term));

    // Filtre spécifique par champ ville (si utilisé dans la vue Services)
    const matchesLocationFilter = !locationFilter || ad.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    // 2. Category View Filter
    let matchesView = true;
    if (view === 'SERVICES') matchesView = ad.category === AdCategory.SERVICE;
    if (view === 'TRANSPORT') matchesView = ad.category === AdCategory.TRANSPORT;

    // 3. Specific Tag Filter (clicked from categories)
    const matchesTag = activeTagFilter ? ad.tags.includes(activeTagFilter) : true;

    return matchesSearch && matchesLocationFilter && matchesView && matchesTag;
  });

  const filteredUsers = MOCK_USERS.filter(user => {
    const term = userSearchTerm.toLowerCase();
    return (
      user.role !== UserRole.ADMIN && // Hide admin in public list
      (user.name.toLowerCase().includes(term) || 
       (user.address && user.address.toLowerCase().includes(term)) ||
       (user.bio && user.bio.toLowerCase().includes(term)) ||
       user.role.toLowerCase().includes(term))
    );
  });

  // Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    // After login, if we were in a flow, we stay there.
    // If we were just logging in from navbar, we might want to stay on current view.
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('HOME');
  };

  const handleCreateAd = (newAd: Ad) => {
    setAds([newAd, ...ads]);
    
    // Redirection intelligente: Si c'est du transport, on va vers Transport, sinon Services
    if (newAd.category === AdCategory.TRANSPORT) {
      setView('TRANSPORT');
    } else {
      setView('SERVICES'); 
    }
    
    // Reset des filtres pour voir la nouvelle annonce immédiatement
    setSearchTerm('');
    setActiveTagFilter(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. User clicks on Ad Card -> Goes to Details View
  const handleViewAdDetails = (ad: Ad) => {
    setSelectedAd(ad);
    setView('AD_DETAILS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. User clicks Contact from Details -> Goes to Chat
  const handleContactFromDetails = () => {
    if (!selectedAd) return;
    
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (selectedAd.authorId === currentUser.id) {
      alert("Vous ne pouvez pas vous envoyer de message à vous-même.");
      return;
    }
    setInitialChatContactId(selectedAd.authorId);
    setView('MESSAGING');
  };

  // Contact user directly from Community view
  const handleContactUser = (targetUserId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (targetUserId === currentUser.id) {
      alert("C'est votre propre profil.");
      return;
    }
    setInitialChatContactId(targetUserId);
    setView('MESSAGING');
  };

  // 3. User clicks Book from Details -> Opens Payment Modal
  const handleBookFromDetails = () => {
    if (!selectedAd) return;

    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setAdToPay(selectedAd);
    setShowPayment(true);
  };

  // 4. User clicks Publish -> Goes to Create Ad
  const handleNavigate = (newView: string) => {
    if (newView === 'CREATE_AD' && !currentUser) {
      setShowAuthModal(true);
      return;
    }

    setView(newView);
    // Reset tag filter when navigating via main menu unless creating an ad
    if (newView !== 'CREATE_AD') {
      setActiveTagFilter(null);
    }
    if (newView !== 'MESSAGING') {
      setInitialChatContactId(undefined);
    }
    // Reset selected ad when navigating away from details
    if (newView !== 'AD_DETAILS') {
      setSelectedAd(null);
    }
  };

  const handleNavbarSearch = (term: string) => {
    // Logique de recherche globale améliorée
    
    if (view === 'COMMUNITY') {
      // Si on est déjà dans Communauté, on cherche des utilisateurs
      setUserSearchTerm(term);
    } else {
      // Sinon (Home, Services, Transport, etc.), on cherche des annonces
      setSearchTerm(term);
      
      // Si on n'est pas dans une vue de liste d'annonces, on redirige vers Services par défaut
      if (view !== 'SERVICES' && view !== 'TRANSPORT') {
        setView('SERVICES');
      }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAd = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
        setAds(ads.filter(a => a.id !== id));
    }
  };

  const handleSendMessage = (content: string, receiverId: string) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: receiverId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages([...messages, newMessage]);
  };

  const handleCategoryClick = (category: typeof SERVICE_CATEGORIES[0]) => {
    setView(category.targetView);
    setActiveTagFilter(category.filterTag);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetails = () => {
    // Return to previous logical view based on the category of the ad
    if (selectedAd?.category === AdCategory.TRANSPORT) {
        setView('TRANSPORT');
    } else {
        setView('SERVICES');
    }
    setSelectedAd(null);
  };

  // Render Views
  const renderContent = () => {
    if (view === 'AD_DETAILS') {
      if (!selectedAd) return <div>Erreur: Annonce non trouvée</div>;
      return (
        <AdDetails 
          ad={selectedAd}
          onBack={handleBackFromDetails}
          onContact={handleContactFromDetails}
          onBook={handleBookFromDetails}
        />
      );
    }

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

    if (view === 'MESSAGING') {
      if (!currentUser) return <div className="p-10 text-center">Veuillez vous connecter pour accéder à la messagerie.</div>;
      return (
        <ChatWindow 
          currentUser={currentUser}
          initialContactId={initialChatContactId}
          allUsers={MOCK_USERS}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      );
    }

    if (view === 'COMMUNITY') {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">La Communauté AfroConnect</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mb-8">
              Trouvez un prestataire de confiance, un voyageur pour vos colis, ou un client à proximité.
            </p>
            
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm"
                placeholder="Rechercher par nom, métier ou ville (ex: Coiffeuse, Abidjan...)"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-gray-50 object-cover" />
                    <div>
                      <h3 className="font-bold text-gray-900">{user.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                        ${user.role === UserRole.PROVIDER ? 'bg-green-100 text-green-800' : 
                          user.role === UserRole.TRAVELER ? 'bg-orange-100 text-orange-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {user.role === UserRole.PROVIDER ? 'Prestataire' : 
                         user.role === UserRole.TRAVELER ? 'Voyageur (GP)' : 'Client'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-600 text-xs font-bold">
                    <Star size={12} className="mr-1 fill-current" />
                    {user.rating}
                  </div>
                </div>
                
                {user.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {user.bio}
                  </p>
                )}

                <div className="flex items-center text-gray-500 text-xs mb-6">
                  <MapPin size={14} className="mr-1" />
                  {user.address || 'Non renseigné'}
                </div>

                <button 
                  onClick={() => handleContactUser(user.id)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-teal-700 transition"
                >
                  <Mail size={16} className="mr-2" />
                  Envoyer un message
                </button>
              </div>
            ))}
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucun utilisateur trouvé pour "{userSearchTerm}"</p>
            </div>
          )}
        </div>
      );
    }

    if (view === 'ADMIN') {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
          return <div className="p-10 text-center text-red-500">Accès refusé.</div>;
      }
      return (
        <div className="max-w-6xl mx-auto py-10 px-4">
           <h2 className="text-3xl font-bold mb-6">Tableau de bord Administrateur</h2>
           {/* Admin content... (simplified for brevity as it was existing) */}
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
        const myAds = ads.filter(ad => ad.authorId === currentUser.id);

        return (
            <div className="max-w-5xl mx-auto py-10 px-4">
                {/* Header Profil */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-teal-50 z-0"></div>
                    
                    <div className="relative z-10">
                         <div className="relative">
                            <img src={currentUser.avatar} className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white" alt={currentUser.name} />
                            <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-teal-700 transition shadow-sm" title="Modifier la photo">
                                <Settings size={16} />
                            </button>
                         </div>
                    </div>
                    
                    <div className="flex-grow text-center md:text-left relative z-10 pt-4 md:pt-8">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 justify-center md:justify-start">
                             <h2 className="text-3xl font-bold text-gray-900">{currentUser.name}</h2>
                             <span className={`px-3 py-1 rounded-full text-xs font-bold text-white w-fit mx-auto md:mx-0 ${
                                 currentUser.role === UserRole.PROVIDER ? 'bg-green-500' : 
                                 currentUser.role === UserRole.TRAVELER ? 'bg-orange-500' : 'bg-blue-500'
                             }`}>
                                {currentUser.role === UserRole.PROVIDER ? 'Prestataire' : 
                                 currentUser.role === UserRole.TRAVELER ? 'Voyageur' : 'Client'}
                             </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 text-sm mb-6">
                            <span className="flex items-center gap-1"><Mail size={14}/> {currentUser.email}</span>
                            <span className="flex items-center gap-1"><Phone size={14}/> {currentUser.phone || 'Non renseigné'}</span>
                            <span className="flex items-center gap-1"><MapPin size={14}/> {currentUser.address || 'Non renseigné'}</span>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                             <div className="bg-orange-50 text-orange-800 px-4 py-2 rounded-lg flex items-center gap-2 font-bold border border-orange-100">
                                <Wallet size={18} />
                                <span>Solde: {currentUser.walletBalance.toLocaleString()} XOF</span>
                             </div>
                             <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 font-bold border border-red-100 hover:bg-red-100 transition shadow-sm">
                                <LogOut size={18} />
                                Déconnexion
                             </button>
                        </div>
                    </div>
                </div>

                {/* Mes Annonces Section */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <LayoutDashboard size={24} className="text-primary" />
                      Mes Annonces ({myAds.length})
                  </h3>
                  <button onClick={() => handleNavigate('CREATE_AD')} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    <Plus size={16} /> Nouvelle annonce
                  </button>
                </div>

                {myAds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myAds.map(ad => (
                            <div key={ad.id} className="relative group">
                                <AdCard ad={ad} onClick={() => handleViewAdDetails(ad)} />
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteAd(ad.id); }} 
                                      className="bg-white text-red-500 p-2 rounded-full shadow-md hover:bg-red-50 border border-gray-100" 
                                      title="Supprimer l'annonce"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-12 text-center border border-gray-100 border-dashed">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                             <Plus size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Vous n'avez aucune annonce</h3>
                        <p className="text-gray-500 mb-6">Commencez par proposer un service ou vendre des kilos.</p>
                        <button onClick={() => handleNavigate('CREATE_AD')} className="text-primary font-bold hover:underline">Publier une annonce</button>
                    </div>
                )}
            </div>
        )
    }

    // Views: HOME, SERVICES, TRANSPORT
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        
        {/* Hero Section for Home */}
        {view === 'HOME' && (
          <>
            <div className="mb-12 bg-gradient-to-r from-primary to-teal-800 rounded-3xl p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Trouvez le service idéal ou envoyez vos colis.</h1>
                <p className="text-xl opacity-90 mb-8">AfroConnect simplifie vos besoins quotidiens et vos échanges internationaux.</p>
                <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                  <button onClick={() => handleNavigate('SERVICES')} className="bg-secondary hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-orange-500/30">Trouver un prestataire</button>
                  <button onClick={() => handleNavigate('TRANSPORT')} className="bg-white/10 backdrop-blur hover:bg-white/20 border border-white/30 px-8 py-4 rounded-xl font-bold text-lg transition">Envoyer un colis</button>
                  <button onClick={() => handleNavigate('CREATE_AD')} className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 shadow-lg">
                    <PlusCircle size={20} />
                    Publier une offre
                  </button>
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
                            <AdCard 
                              key={ad.id} 
                              ad={ad} 
                              onClick={() => handleViewAdDetails(ad)} 
                            />
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
                        <AdCard 
                          key={ad.id} 
                          ad={ad} 
                          onClick={() => handleViewAdDetails(ad)} 
                        />
                    ))}
                </div>

                {/* Call to Action for Publishing */}
                <div className="mt-16 bg-teal-900 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Vous avez un talent ou vous voyagez ?</h2>
                        <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
                            Gagnez de l'argent en proposant vos services ou en vendant vos kilos disponibles. 
                            Rejoignez la communauté AfroConnect.
                        </p>
                        <button 
                            onClick={() => handleNavigate('CREATE_AD')}
                            className="bg-white text-teal-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg inline-flex items-center gap-2"
                        >
                            <PlusCircle size={20} />
                            Publier une offre maintenant
                        </button>
                    </div>
                     <div className="absolute top-0 left-0 w-64 h-64 bg-teal-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
                </div>
            </div>
        )}

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 font-sans text-gray-900">
        <Navbar 
            currentUser={currentUser} 
            onNavigate={handleNavigate} 
            onLoginClick={() => setShowAuthModal(true)} 
            onLogout={handleLogout}
            currentView={view}
            onSearch={handleNavbarSearch}
        />
        
        <main>
            {renderContent()}
        </main>
        
        {/* Floating Action Button (FAB) for Publishing - Visible on all views except CREATE_AD */}
        {view !== 'CREATE_AD' && (
            <button 
              onClick={() => handleNavigate('CREATE_AD')}
              className="fixed bottom-6 right-6 bg-secondary text-white p-4 rounded-full shadow-2xl hover:bg-orange-600 hover:scale-110 transition transform z-40 flex items-center gap-2"
              aria-label="Publier une offre"
            >
              <Plus size={28} />
              <span className="font-bold pr-1 md:hidden">Publier</span>
            </button>
        )}

        <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onLogin={handleAuthSuccess}
        />

        <PaymentModal
            isOpen={showPayment}
            onClose={() => setShowPayment(false)}
            amount={adToPay?.price || 0}
            recipientName={adToPay?.authorName || ''}
            onSuccess={() => {
                setShowPayment(false);
                alert("Paiement effectué avec succès!");
            }}
        />
    </div>
  );
};

export default App;