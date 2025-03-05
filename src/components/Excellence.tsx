import React from 'react';
import { motion } from 'framer-motion';
import { Laptop, Users, Trophy } from 'lucide-react';

const Excellence = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Une Formation <span className="text-blue-600">D'Excellence</span>
          </h2>
          <p className="text-xl text-gray-600">
            Découvrez pourquoi nos étudiants excellent dans leur carrière
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Laptop className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-4">Formation Hybride</h3>
            <p className="text-gray-600">
              Combinez apprentissage en ligne et présentiel pour une expérience optimale
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-4">Experts du Domaine</h3>
            <p className="text-gray-600">
              Apprenez avec des professionnels reconnus dans leur domaine
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Trophy className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-4">Certification Reconnue</h3>
            <p className="text-gray-600">
              Obtenez une certification valorisée par les entreprises
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Excellence;