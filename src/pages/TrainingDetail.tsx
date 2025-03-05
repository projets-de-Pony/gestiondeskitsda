import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Calendar, Users, Laptop, CheckCircle2, ArrowRight } from 'lucide-react';
import { trainings } from '../data/trainings';
import { EnrollmentForm } from '../types';
import emailjs from '@emailjs/browser';

const TrainingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const training = trainings.find(t => t.id === id);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<EnrollmentForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    education: '',
    experience: '',
    motivation: ''
  });

  if (!training) {
    return <div>Formation non trouvée</div>;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await emailjs.send(
        'service_ghtlizb',
        'template_j347zi8',
        {
          to_email: 'digitalacademy2368@gmail.com',
          formation_title: training.title,
          formation_price: formatPrice(training.price),
          formation_start: new Date(training.startDate).toLocaleDateString(),
          ...form
        },
        'crYUSQa5L2mSWQPIX'
      );

      setSuccess(true);
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        education: '',
        experience: '',
        motivation: ''
      });
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={training.image}
          alt={training.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full mb-4">
              {training.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {training.title}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mb-8">
              {training.description}
            </p>
            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {training.duration}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Début: {new Date(training.startDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                {training.format === 'video' ? <Laptop className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                {training.format.charAt(0).toUpperCase() + training.format.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-8">Programme de la Formation</h2>
            <div className="space-y-6">
              {training.modules.map((module, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{module.title}</h3>
                    <span className="text-blue-600 font-medium">{module.duration}</span>
                  </div>
                  <ul className="space-y-3">
                    {module.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="flex items-start gap-3 text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
              <div className="text-3xl font-bold text-blue-600 mb-6">
                {formatPrice(training.price)}
              </div>
              
              {!showEnrollment ? (
                <button
                  onClick={() => setShowEnrollment(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  S'inscrire maintenant
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg">
                      Votre inscription a été envoyée avec succès !
                    </div>
                  )}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Niveau d'études
                      </label>
                      <input
                        type="text"
                        name="education"
                        value={form.education}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expérience
                      </label>
                      <textarea
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivation
                      </label>
                      <textarea
                        name="motivation"
                        value={form.motivation}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        rows={3}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        'Envoyer ma candidature'
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDetail;