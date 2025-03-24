import React from 'react';
import { motion } from 'framer-motion';
import { Code, Palette, Megaphone, ShoppingCart, Users, ArrowRight, CheckCircle2, MessageCircle, User } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <Code className="w-12 h-12" />,
      title: 'Développement Web',
      description: 'Création de sites web et applications sur mesure avec les dernières technologies.',
      features: [
        'Sites vitrines et e-commerce',
        'Applications web progressives',
        'Interfaces administrateur',
        'Optimisation des performances'
      ]
    },
    {
      icon: <Palette className="w-12 h-12" />,
      title: 'Design UX/UI',
      description: 'Conception d\'interfaces utilisateur intuitives et esthétiques pour une expérience optimale.',
      features: [
        'Design responsive',
        'Prototypage interactif',
        'Tests utilisateurs',
        'Guidelines et documentation'
      ]
    },
    {
      icon: <Megaphone className="w-12 h-12" />,
      title: 'Marketing Digital',
      description: 'Stratégies marketing complètes pour augmenter votre visibilité en ligne.',
      features: [
        'SEO et référencement',
        'Campagnes publicitaires',
        'Content marketing',
        'Analyse des performances'
      ]
    },
    {
      icon: <ShoppingCart className="w-12 h-12" />,
      title: 'Solutions E-commerce',
      description: 'Mise en place et optimisation de votre boutique en ligne pour maximiser vos ventes.',
      features: [
        'Plateformes e-commerce',
        'Optimisation des conversions',
        'Gestion des paiements',
        'Intégration logistique'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Jean Dupont',
      role: 'CEO, TechStart',
      content: 'Un service exceptionnel qui a transformé notre présence en ligne. Hautement recommandé !'
    },
    {
      name: 'Marie Claire',
      role: 'Directrice Marketing, EcoShop',
      content: 'L\'équipe a su comprendre nos besoins et livrer des résultats au-delà de nos attentes.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">Nos Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="text-blue-600 mb-6">{service.icon}</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">{service.title}</h3>
            <p className="text-gray-600 mb-6">{service.description}</p>
            <ul className="space-y-3">
              {service.features.map((feature, fIndex) => (
                <li key={fIndex} className="flex items-start gap-3 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Testimonials */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Ce Que Disent Nos Clients</h2>
            <p className="text-xl text-gray-600">Découvrez les retours d'expérience de nos clients satisfaits</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-8 rounded-2xl"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
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
              Prêt à Transformer Votre Business ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Contactez-nous pour discuter de votre projet et obtenir un devis personnalisé
            </p>
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full text-lg font-semibold transition-colors inline-flex items-center gap-2">
              Nous Contacter
              <MessageCircle className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;