import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Clock, Award, BookOpen, Target, ArrowRight } from 'lucide-react';
import { trainings } from '../data/trainings';

const Formations = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: '40+', label: 'Étudiants Formés' },
    { icon: <GraduationCap className="w-6 h-6" />, value: '95%', label: 'Taux de Réussite' },
    { icon: <Award className="w-6 h-6" />, value: '100%', label: 'Satisfaction Client' },
    { icon: <Target className="w-6 h-6" />, value: '85%', label: 'Insertion Professionnelle' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-600 to-blue-800 text-white py-24">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_85%)] opacity-20" />
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Formations Professionnelles
            </h1>
            <p className="text-xl text-blue-100 mb-12">
              Des formations de qualité pour développer vos compétences et accélérer votre carrière dans le numérique
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex justify-center mb-3 text-blue-300">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {trainings.map((training, index) => (
              <motion.div
                key={training.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                variants={fadeIn}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={training.image}
                    alt={training.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                      {training.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{training.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{training.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      {training.duration}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="w-5 h-5" />
                      {training.format}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat('fr-FR').format(training.price)} FCFA
                    </span>
                    <button className="group inline-flex items-center gap-2 bg-gray-100 hover:bg-blue-600 px-4 py-2 rounded-full text-gray-600 hover:text-white transition-all duration-300">
                      Détails
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Prêt à Commencer Votre Formation ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Rejoignez notre communauté d'apprenants et transformez votre carrière dès aujourd'hui
            </p>
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full text-lg font-semibold transition-colors inline-flex items-center gap-2">
              S'inscrire Maintenant
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Formations;