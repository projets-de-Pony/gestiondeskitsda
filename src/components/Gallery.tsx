import React from 'react';
import { motion } from 'framer-motion';

interface GalleryItem {
  id: number;
  image: string;
  type: 'formation' | 'conference' | 'sortie';
  title: string;
  location: string;
  description: string;
}

const Gallery = () => {
  const galleryItems: GalleryItem[] = [
    {
      id: 1,
      image: "/evenementdeformation.jpg",
      type: "formation",
      title: "Compétition de FRAROTY",
      location: "Salle de conférence",
      description: "Session intensive de formation, de partage et de compétition entre jeune startup"
    },
    {
      id: 2,
      image: "/premiereconferenceda.jpg",
      type: "conference",
      title: "Tech Summit 2020",
      location: "Salle MANU DIBANGO, DSCHANG",
      description: "Conférence annuelle sur les tendances technologiques et lesastuces de déblogage mobile"
    },
    {
      id: 3,
      image: "/evenementdeformation2.jpg",
      type: "sortie",
      title: "Team Building",
      location: "Limbe Beach",
      description: "Journée de cohésion d'équipe et d'activités en plein air"
    }
  ];

  const typeColors = {
    formation: 'bg-blue-600',
    conference: 'bg-purple-600',
    sortie: 'bg-green-600'
  };

  const typeLabels = {
    formation: 'Formation',
    conference: 'Conférence',
    sortie: 'Sortie'
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6">Notre Galerie</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les moments forts de notre académie à travers notre galerie photo
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-4">
          {/* Grande image à gauche */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="col-span-12 md:col-span-8 relative overflow-hidden rounded-2xl shadow-lg group h-[600px]"
          >
            <img
              src={galleryItems[0].image}
              alt={galleryItems[0].title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100">
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className={`inline-block px-4 py-2 rounded-full text-sm text-white mb-4 ${typeColors[galleryItems[0].type]}`}>
                  {typeLabels[galleryItems[0].type]}
                </span>
                <h3 className="text-3xl font-bold text-white mb-3">{galleryItems[0].title}</h3>
                <p className="text-gray-200 text-lg mb-2">{galleryItems[0].location}</p>
                <p className="text-gray-300">{galleryItems[0].description}</p>
              </div>
            </div>
          </motion.div>

          {/* Deux images à droite */}
          <div className="col-span-12 md:col-span-4 space-y-4">
            {[galleryItems[1], galleryItems[2]].map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 * (index + 1) }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-2xl shadow-lg group h-[290px]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm text-white mb-3 ${typeColors[item.type]}`}>
                      {typeLabels[item.type]}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-200 text-sm">{item.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Rangée du bas avec trois images */}
          {galleryItems.slice(3, 6).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 * (index + 3) }}
              viewport={{ once: true }}
              className="col-span-12 md:col-span-4 relative overflow-hidden rounded-2xl shadow-lg group h-[300px]"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm text-white mb-3 ${typeColors[item.type]}`}>
                    {typeLabels[item.type]}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-200 text-sm mb-2">{item.location}</p>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;