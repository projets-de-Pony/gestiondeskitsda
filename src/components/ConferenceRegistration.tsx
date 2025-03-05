import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Mail, Phone, User, Users, MessageSquare, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { saveConferenceRegistration } from '../lib/conferenceService';

interface FormData {
  name: string;
  email: string;
  phone: string;
  experience: string;
  expectations: string;
  seats: number;
}

const ConferenceRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    experience: '',
    expectations: '',
    seats: 1,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await saveConferenceRegistration(formData);
      if (result.success) {
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
      } else {
        throw new Error('Échec de l\'enregistrement');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.');
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

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name Input */}
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
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    placeholder="Entrez votre nom"
                  />
                </div>
              </div>

              {/* Email Input */}
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
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    placeholder="Entrez votre email"
                  />
                </div>
              </div>

              {/* Phone Input */}
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
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    placeholder="Entrez votre numéro"
                  />
                </div>
              </div>

              {/* Experience Input */}
              <div className="relative">
                <label className="text-gray-700 font-medium mb-2 block">Expérience dans le domaine</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all min-h-[100px]"
                    placeholder="Décrivez votre expérience"
                  />
                </div>
              </div>

              {/* Expectations Input */}
              <div className="relative">
                <label className="text-gray-700 font-medium mb-2 block">Vos attentes</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                  <textarea
                    name="expectations"
                    value={formData.expectations}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all min-h-[100px]"
                    placeholder="Quelles sont vos attentes ?"
                  />
                </div>
              </div>

              {/* Seats Input */}
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
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </form>

            {/* Success Message */}
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-4 left-4 right-4 bg-green-100 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Votre réservation a été enregistrée avec succès !
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-4 left-4 right-4 bg-red-100 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConferenceRegistration; 