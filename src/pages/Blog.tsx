import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, ArrowRight, Heart, Target, Users, X, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  id: number;
  title: string;
  author: string;
  date: string;
  image: string;
  content: string;
  excerpt: string;
  readTime?: string;
  category?: string;
}

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const blogPosts = [
    {
      id: 1,
      title: "MBOGNO JOEL PAULIN: Un Visionnaire de la Tech Camerounaise",
      author: "Digital Academy",
      date: "2024-03-15",
      image: "/promoteurDA.jpg",
      readTime: "5 min",
      category: "Leadership",
      content: `
En tant que promoteur de Digital Academy, MBOGNO JOEL PAULIN incarne l'esprit d'innovation et de changement dans le paysage technologique camerounais. Passionné de technologie et fervent défenseur de l'excellence, il a été profondément marqué par les défis auxquels fait face le secteur IT au Cameroun.

Face à ce constat, il a pris une décision audacieuse : créer un groupe de formation basé sur les compétences et leur valorisation monétaire. Sa vision ? Transformer la façon dont les compétences technologiques sont développées et monétisées au Cameroun.

Depuis plus de 5 ans, il se consacre à la formation et au développement d'une équipe talentueuse, prête à révolutionner le marché camerounais. Son objectif n'est pas simplement de former, mais de créer une nouvelle génération de professionnels IT capables de porter haut le drapeau de l'excellence technologique camerounaise.

À travers Digital Academy, MBOGNO JOEL PAULIN apporte sa pierre à l'édifice du développement numérique du Cameroun, en formant les leaders technologiques de demain.
      `,
      excerpt: "Découvrez le parcours inspirant du fondateur de Digital Academy et sa vision pour l'avenir du numérique au Cameroun."
    },
    {
      id: 2,
      title: "Vision et Objectifs de Digital Academy",
      author: "Digital Academy",
      date: "2024-03-16",
      image: "/premiereconferenceda.jpg",
      readTime: "7 min",
      category: "Vision",
      content: `
Digital Academy s'est fixé une mission claire : révolutionner la formation numérique au Cameroun. Notre vision s'articule autour de plusieurs axes stratégiques :

### Notre Mission
- Former des professionnels IT de classe mondiale
- Créer des opportunités d'emploi dans le secteur numérique
- Contribuer au développement de l'écosystème tech camerounais

### Nos Objectifs
1. **Excellence Académique**
   - Programmes de formation actualisés et pertinents
   - Formateurs experts et passionnés
   - Méthodes pédagogiques innovantes

2. **Insertion Professionnelle**
   - Taux d'insertion de 85% après formation
   - Partenariats avec les entreprises leaders
   - Accompagnement personnalisé

3. **Innovation Continue**
   - Veille technologique permanente
   - Adaptation aux besoins du marché
   - Développement de nouvelles formations

Notre engagement est de transformer chaque apprenant en professionnel compétent et compétitif sur le marché international.
      `,
      excerpt: "Découvrez la vision et les objectifs qui guident Digital Academy dans sa mission de transformation numérique."
    }
  ];

  const testimonials = [
    {
      name: "Marie Laurent",
      role: "Influenceur",
      company: "Digital Academy",
      content: "La formation m'a permis de réaliser mon rêve de devenir Influenceur. L'accompagnement personnalisé et la qualité des cours sont exceptionnels."
    },
    {
      name: "Fogue pony Victor",
      role: "Développeur",
      company: "Digital Academy",
      content: "Une expérience transformative qui m'a donné toutes les clés pour réussir dans le développement web. Je recommande à 100% !"
    },
    {
      name: "Sophie",
      role: "vendeuse en ligne",
      company: "Digital Academy",
      content: "Les projets pratiques et le mentorat m'ont permis de constituer ma première boutique enligne et d'éffectuer mes première vente."
    }
  ];

  const backgroundImages = [
    "/premiereconferenceda.jpg",
    "/evenementdeformation2.jpg",
    "/evenementdeformation3.jpg"
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + backgroundImages.length) % backgroundImages.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section with Carousel */}
      <section className="relative h-[500px] overflow-hidden">
        <motion.div 
          className="absolute inset-0 transition-all duration-700"
          initial={false}
          animate={{ opacity: 1 }}
        >
          <img
            src={backgroundImages[currentImageIndex]}
            alt="Blog"
            className="w-full h-full object-cover transition-transform duration-700 transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/70" />
        </motion.div>

        {/* Carousel Controls */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
                Explorez Notre
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Histoire</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Découvrez les récits qui façonnent l'avenir du numérique au Cameroun
              </p>
              <div className="flex gap-4">
                <motion.div 
                  className="w-3 h-3 rounded-full bg-white/30"
                  animate={{ opacity: currentImageIndex === 0 ? 1 : 0.3 }}
                />
                <motion.div 
                  className="w-3 h-3 rounded-full bg-white/30"
                  animate={{ opacity: currentImageIndex === 1 ? 1 : 0.3 }}
                />
                <motion.div 
                  className="w-3 h-3 rounded-full bg-white/30"
                  animate={{ opacity: currentImageIndex === 2 ? 1 : 0.3 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image Section */}
                    <div className="relative h-[400px] overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6">
                        <span className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 flex flex-col">
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </div>
                      </div>

                      <h2 className="text-2xl font-bold mb-4 text-gray-900">{post.title}</h2>
                      <p className="text-gray-600 mb-6 line-clamp-4">{post.excerpt}</p>

                      <div className="mt-auto flex items-center justify-between">
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group"
                        >
                          Lire la suite
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <Share2 className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {index === 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Notre Impact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">40+</div>
                            <div className="text-blue-600">Étudiants formés</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Target className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">85%</div>
                            <div className="text-blue-600">Taux d'insertion</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Heart className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">100%</div>
                            <div className="text-blue-600">Satisfaction</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl shadow-lg"
                >
                  <p className="text-gray-600 mb-6">{testimonial.content}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{testimonial.name}</h3>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                      <p className="text-blue-600 text-sm">{testimonial.company}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Article Popup */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-[300px] overflow-hidden">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-all"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {selectedPost.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedPost.readTime}
                  </div>
                  {selectedPost.category && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                      {selectedPost.category}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl font-bold mb-8 text-gray-900">{selectedPost.title}</h2>
                
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Blog;