export interface Show {
  id: string;
  title: string;
  timeStart: string; // "HH:MM"
  timeEnd: string;   // "HH:MM"
  description: string;
  hosts?: string[];
  tag?: string;
  day?: 'Segunda a Sexta' | 'Sábado' | 'Domingo';
}

export interface DaySchedule {
  day: string; // e.g., "Segunda a Sexta-feira", "Sábado", "Domingo"
  shows: Show[];
}

export interface SongRequest {
  id: string;
  sender: string;
  song: string;
  artist: string;
  message: string;
  timestamp: string; // Date string or time
  likes: number;
}

export interface PartnershipInquiry {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  interestType: string;
  message: string;
  timestamp: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Música' | 'Cultura' | 'Eventos' | 'Destaque';
  image: string;
  date: string;
  views: number;
  author: string;
}

export interface AdBanner {
  id: string;
  client: string;
  title: string;
  tagline: string;
  category: string;
  ctaText: string;
  ctaLink: string;
  gradient: string; // CSS style gradient representation
}
