export interface Training {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  format: 'video' | 'presentiel' | 'hybride';
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  startDate: string;
  category: string;
  image: string;
  modules: {
    title: string;
    duration: string;
    topics: string[];
  }[];
}

export interface EnrollmentForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  education: string;
  experience: string;
  motivation: string;
}
// 
