
import { Ad, AdCategory, ServiceType, User, UserRole, Message } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Aminata Diallo',
    email: 'aminata@example.com',
    phone: '+225 0707070707',
    address: 'Cocody, Abidjan',
    avatar: 'https://picsum.photos/seed/aminata/100/100',
    role: UserRole.PROVIDER,
    bio: 'Experte en coiffure et tresses africaines.',
    rating: 4.8,
    reviewsCount: 12,
    walletBalance: 15000
  },
  {
    id: 'u2',
    name: 'Jean Kouame',
    email: 'jean@example.com',
    phone: '+33 612345678',
    address: '15 Rue de Paris',
    avatar: 'https://picsum.photos/seed/jean/100/100',
    role: UserRole.TRAVELER,
    bio: 'Je voyage souvent entre Paris et Abidjan.',
    rating: 4.9,
    reviewsCount: 5,
    walletBalance: 50000
  },
  {
    id: 'admin1',
    name: 'Super Admin',
    email: 'admin@afroconnect.com',
    phone: '0000000000',
    avatar: 'https://picsum.photos/seed/admin/100/100',
    role: UserRole.ADMIN,
    rating: 5.0,
    reviewsCount: 0,
    walletBalance: 0
  }
];

export const MOCK_ADS: Ad[] = [
  {
    id: 'ad1',
    authorId: 'u1',
    authorName: 'Aminata Diallo',
    authorAvatar: 'https://picsum.photos/seed/aminata/100/100',
    category: AdCategory.SERVICE,
    title: 'Tresses et Coiffure à domicile',
    description: 'Je propose mes services de coiffure à domicile. Tresses, tissages, nattes collées. Disponible le weekend.',
    price: 15000,
    currency: 'XOF',
    location: 'Abidjan, Cocody',
    status: 'ACTIVE',
    tags: [ServiceType.HAIRDRESSING, 'Beauté'],
    image: 'https://picsum.photos/seed/hair/400/300'
  },
  {
    id: 'ad2',
    authorId: 'u2',
    authorName: 'Jean Kouame',
    authorAvatar: 'https://picsum.photos/seed/jean/100/100',
    category: AdCategory.TRANSPORT,
    title: 'Paris -> Abidjan (5kg dispo)',
    description: 'Je voyage le 25 Octobre. Il me reste 5kg de place dans ma valise. Documents ou petits colis acceptés.',
    price: 10,
    currency: 'EUR/kg',
    location: 'Paris',
    locationTo: 'Abidjan',
    date: '2023-10-25',
    status: 'ACTIVE',
    tags: ['Voyage', 'Colis'],
    image: 'https://picsum.photos/seed/travel/400/300'
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'u1',
    receiverId: 'currentUser', // Simulating the logged-in user
    content: 'Bonjour, est-ce que vous êtes disponible ce samedi ?',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isRead: true
  },
  {
    id: 'm2',
    senderId: 'currentUser',
    receiverId: 'u1',
    content: 'Bonjour Aminata, oui tout à fait. Vers quelle heure ?',
    timestamp: new Date(Date.now() - 80000000).toISOString(),
    isRead: true
  },
  {
    id: 'm3',
    senderId: 'u1',
    receiverId: 'currentUser',
    content: 'Super ! Disons 14h ?',
    timestamp: new Date(Date.now() - 7000000).toISOString(),
    isRead: false
  }
];
