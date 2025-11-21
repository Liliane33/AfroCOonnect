
export enum UserRole {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER', // Prestataire
  TRAVELER = 'TRAVELER', // Voyageur (GP)
  ADMIN = 'ADMIN'
}

export enum AdCategory {
  SERVICE = 'SERVICE',
  TRANSPORT = 'TRANSPORT'
}

export enum ServiceType {
  CLEANING = 'Ménage',
  PLUMBING = 'Plomberie',
  HAIRDRESSING = 'Coiffure',
  GARDENING = 'Jardinage',
  TUTORING = 'Soutien Scolaire',
  OTHER = 'Autre'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar: string;
  role: UserRole;
  bio?: string;
  rating: number;
  reviewsCount: number;
  walletBalance: number;
}

export interface Ad {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: AdCategory;
  title: string;
  description: string;
  price: number; // Prix du service ou prix au kg
  currency: string;
  location: string;
  locationTo?: string; // Pour le transport (Destination)
  date?: string; // Date de dispo ou date de voyage
  image?: string;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  tags: string[];
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  method: 'ORANGE_MONEY' | 'MTN_MOMO' | 'CARD' | 'PAYPAL';
  status: 'SUCCESS' | 'PENDING';
  commission: number;
  userId: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}
