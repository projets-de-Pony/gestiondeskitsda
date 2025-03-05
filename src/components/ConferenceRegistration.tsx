import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Mail, Phone, User, Users, MessageSquare, CheckCircle, Loader2, AlertCircle, Search } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FormData {
  name: string;
  email: string;
  phone: string;
  experience: string;
  expectations: string;
  seats: number;
}

const ConferenceRegistration = () => {
  const [isNewParticipant, setIsNewParticipant] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    experience: '',
    expectations: '',
    seats: 1,
  });
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [existingParticipant, setExistingParticipant] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recherche d'un participant existant
  const handleSearch = async () => {
    if (!searchEmail) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const q = query(
        collection(db, 'conference_registrations'),
        where('email', '==', searchEmail.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const participantData = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        };
        setExistingParticipant(participantData);
      } else {
        setError("Aucun participant trouvé avec cet email. Veuillez vous inscrire en tant que nouveau participant.");
        setIsNewParticipant(true);
      }
    } catch (err) {
      console.error("Erreur lors de la recherche:", err);
      setError("Erreur lors de la recherche. Veuillez réessayer.");
    } finally {
      setIsSearching(false);
    }
  };

  // Confirmation de présence pour un participant existant
  const handleConfirmPresence = async () => {
    if (!existingParticipant) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await updateDoc(doc(db, 'conference_registrations', existingParticipant.id), {
        present: true,
        registrationDate: new Date(),
        seats: formData.seats
      });
      
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      console.error("Erreur lors de la confirmation:", err);
      setError("Erreur lors de la confirmation de présence");
    } finally {
      setIsLoading(false);
    }
  };

  // Inscription d'un nouveau participant
  const handleNewRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, 'conference_registrations'), {
        ...formData,
        email: formData.email.toLowerCase(),
        registrationDate: new Date(),
        present: true
      });
      
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        experience: '',
        expectations: '',
        seats: 1,
      });
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
      setError("Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <section className="py-24 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Réservez Votre Place pour la
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"> Conférence</span>
            </h2>
            <p className="text-xl text-gray-600">
              Rejoignez-nous chaque vendredi à 18h00 pour une conférence enrichissante
            </p>
          </div>

          {/* Sélection du type de participant */}
          {isNewParticipant === null && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
              <h3 className="text-2xl font-semibold mb-6 text-center">Êtes-vous un nouveau participant ?</h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsNewParticipant(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Oui, je suis nouveau
                </button>
                <button
                  onClick={() => setIsNewParticipant(false)}
                  className="px-6 py-3 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Non, je suis déjà inscrit
                </button>
              </div>
            </div>
          )}

          {/* Recherche pour les participants existants */}
          {isNewParticipant === false && !existingParticipant && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h3 className="text-2xl font-semibold mb-6">Confirmez votre présence</h3>
              <div className="space-y-6">
                <div className="relative">
                  <label className="text-gray-700 font-medium mb-2 block">Email d'inscription</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="Entrez votre email"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Recherche en cours...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Rechercher
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsNewParticipant(null)}
                  className="w-full text-gray-600 py-2 hover:text-blue-600 transition-colors"
                >
                  Retour
                </button>
              </div>
            </div>
          )}

          {/* Confirmation de présence */}
          {existingParticipant && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <h3 className="text-2xl font-semibold mb-6">Confirmer votre présence</h3>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="font-medium text-gray-900">{existingParticipant.name}</p>
                  <p className="text-gray-600">{existingParticipant.email}</p>
                </div>
                <div className="relative">
                  <label className="text-gray-700 font-medium mb-2 block">Nombre de places</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="seats"
                      value={formData.seats}
                      onChange={handleChange}
                      min="1"
                      max="5"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleConfirmPresence}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Confirmation en cours...
                    </>
                  ) : (
                    'Confirmer ma présence'
                  )}
                </button>
                <button
                  onClick={() => {
                    setExistingParticipant(null);
                    setSearchEmail('');
                    setIsNewParticipant(null);
                  }}
                  className="w-full text-gray-600 py-2 hover:text-blue-600 transition-colors"
                >
                  Retour
                </button>
              </div>
            </div>
          )}

          {/* Formulaire pour nouveau participant */}
          {isNewParticipant === true && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <form onSubmit={handleNewRegistration} className="space-y-8">
                <div className="relative">
                  <label className="text-gray-700 font-medium mb-2 block">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="Entrez votre nom"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-gray-700 font-medium mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="Entrez votre email"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-gray-700 font-medium mb-2 block">Numéro de téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="Entrez votre numéro"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-gray-700 font-medium mb-2 block">Expérience dans le domaine</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none min-h-[100px]"
                      placeholder="Décrivez votre expérience"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-gray-700 font-medium mb-2 block">Vos attentes</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      name="expectations"
                      value={formData.expectations}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none min-h-[100px]"
                      placeholder="Quelles sont vos attentes ?"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-gray-700 font-medium mb-2 block">Nombre de places</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="seats"
                      value={formData.seats}
                      onChange={handleChange}
                      min="1"
                      max="5"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Traitement en cours...
                      </>
                    ) : (
                      'Réserver ma place'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewParticipant(null)}
                    className="text-gray-600 py-2 hover:text-blue-600 transition-colors"
                  >
                    Retour
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Messages de succès et d'erreur */}
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed bottom-4 left-4 right-4 bg-green-100 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {existingParticipant ? 'Votre présence a été confirmée avec succès !' : 'Votre réservation a été enregistrée avec succès !'}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed bottom-4 left-4 right-4 bg-red-100 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ConferenceRegistration; 