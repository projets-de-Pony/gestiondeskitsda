import React from 'react';
import { motion } from 'framer-motion';
import { Target, Award, BookOpen, Users, Heart } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Excellence",
      description: "Nous visons l'excellence dans chaque aspect de notre formation"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Innovation",
      description: "Nous adoptons les dernières technologies et méthodologies"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Apprentissage Continu",
      description: "Nous encourageons l'apprentissage tout au long de la vie"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Passion",
      description: "Nous transmettons notre passion pour le numérique"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/evenementdeformation.jpg"
            alt="About Us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/70 mix-blend-multiply" />
        </div>
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold text-white mb-6">
                Notre Histoire
              </h1>
              <p className="text-xl text-blue-100">
                Depuis 2020, Digital Academy forme les leaders du numérique de demain. 
                Notre mission est de démocratiser l'accès aux compétences digitales au Cameroun.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Notre Mission</h2>
              <p className="text-xl text-gray-600 mb-8">
                Nous croyons que chaque talent mérite d'être développé. Notre mission est de former 
                la prochaine génération de professionnels du numérique en Afrique.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <p className="text-gray-600">Formation de qualité internationale</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <p className="text-gray-600">Accompagnement personnalisé</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <p className="text-gray-600">Insertion professionnelle garantie</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="/premiereconferenceda.jpg"
                alt="Mission"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-6 rounded-xl">
                <div className="text-4xl font-bold mb-2">03+</div>
                <div className="text-blue-100">Années d'expérience</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Nos Valeurs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des principes qui guident chacune de nos actions et façonnent l'expérience 
              d'apprentissage de nos étudiants
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-8 rounded-xl text-center"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Notre Direction</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une vision claire pour l'avenir du numérique au Cameroun
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-[500px] overflow-hidden">
                  <img
                    src="/promoteurDA.jpg"
                    alt="MBOGNO JOEL PAULIN"
                    className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold mb-2">MBOGNO JOEL PAULIN</h3>
                    <p className="text-blue-600 text-lg mb-6">Fondateur & Directeur Général</p>
                    <div className="space-y-4 text-gray-600">
                      <p>
                        Visionnaire et passionné de technologie, MBOGNO JOEL PAULIN a fondé Digital Academy 
                        avec une mission claire : transformer le paysage numérique au Cameroun.
                      </p>
                      <p>
                        Fort de son expertise en développement web et en formation, il dirige l'académie 
                        avec une vision axée sur l'excellence et l'innovation.
                      </p>
                      <p>
                        Son engagement : former la prochaine génération de leaders numériques africains 
                        capables de rivaliser sur la scène internationale.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">3+</div>
                      <div className="text-gray-600">Années d'expérience</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">40+</div>
                      <div className="text-gray-600">Étudiants formés</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;