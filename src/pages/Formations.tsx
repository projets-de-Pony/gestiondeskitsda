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
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">Nos Formations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Contenu des formations à venir */}
      </div>
    </div>
  );
};

export default Formations;