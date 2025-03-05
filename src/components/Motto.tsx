import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Sparkles, Users } from 'lucide-react';

const Motto = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-5 h-5 text-blue-200" />
            <span className="text-blue-100">Notre Philosophie</span>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-7xl font-bold text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Skills = Money
          </motion.h2>

          <motion.p
            className="text-xl text-blue-100 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            Investissez dans vos compétences aujourd'hui pour assurer votre prospérité demain
          </motion.p>

          <motion.div
            className="inline-flex items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg px-6 py-4 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-200" />
              <div className="text-left">
                <div className="text-white font-semibold">Salaire Moyen</div>
                <div className="text-blue-200">+75% après formation</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg px-6 py-4 rounded-xl">
              <Users className="w-6 h-6 text-blue-200" />
              <div className="text-left">
                <div className="text-white font-semibold">Taux d'Emploi</div>
                <div className="text-blue-200">92% après 6 mois</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Motto;