import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ConferenceRegistration {
  name: string;
  email: string;
  phone: string;
  experience: string;
  expectations: string;
  seats: number;
  registrationDate: Date;
}

export const saveConferenceRegistration = async (registration: Omit<ConferenceRegistration, 'registrationDate'>) => {
  try {
    const docRef = await addDoc(collection(db, 'conference_registrations'), {
      ...registration,
      registrationDate: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving conference registration:', error);
    return { success: false, error };
  }
}; 