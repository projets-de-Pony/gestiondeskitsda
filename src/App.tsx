import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ArrowRight, Play, User } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TrainingGrid from './components/TrainingGrid';
import Gallery from './components/Gallery';
import Motto from './components/Motto';
import Excellence from './components/Excellence';
import TrainingDetail from './pages/TrainingDetail';
import Formations from './pages/Formations';
import Services from './pages/Services';
import Contact from './pages/Contact';
import About from './pages/About';
import Blog from './pages/Blog';
import ConferenceRegistration from './components/ConferenceRegistration';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const testimonials = [
    {
      name: "Marie Laurent",
      role: "Data Scientist",
      company: "Digital Academy",
      content: "La formation m'a permis de réaliser mon rêve de devenir Data Scientist. L'accompagnement personnalisé et la qualité des cours sont exceptionnels."
    },
    {
      name: "Thomas Dubois",
      role: "Développeur Full-Stack",
      company: "Digital Academy",
      content: "Une expérience transformative qui m'a donné toutes les clés pour réussir dans le développement web. Je recommande à 100% !"
    },
    {
      name: "Sophie Martin",
      role: "UX Designer",
      company: "Digital Academy",
      content: "Les projets pratiques et le mentorat m'ont permis de constituer un portfolio solide et de décrocher mon premier poste en tant que UX Designer."
    }
  ];

  const stats = [
    { value: "95%", label: "Taux de réussite" },
    { value: "40+", label: "Étudiants formés" },
    { value: "5+", label: "Entreprises partenaires" },
    { value: "3+", label: "Années d'expérience" }
  ];

  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900">
        <Navbar />
        
        <Routes>
          <Route path="/" element={
            <>
              {/* Hero Section */}
              <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3b82f6,transparent_70%)] opacity-10" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_85%)] opacity-10" />
                
                <div className="container mx-auto px-4 pt-32 pb-24">
                  <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-8">
                      <span className="text-blue-600 font-medium">Nouveau</span>
                      <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                      <span className="text-gray-600">Formation en NO-CODE</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-gray-900">
                      Façonnez Votre Avenir
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                        Dans Le Numérique
                      </span>
                    </h1>
                    
                    <p className="text-xl text-gray-600 mb-12 max-w-3xl">
                      Rejoignez la Digital Academy et transformez vos ambitions en réalité. 
                      Des formations d'excellence pour les leaders de demain.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 mb-16">
                      <button className="group bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-full text-lg font-semibold text-white transition-all flex items-center justify-center gap-2">
                        Démarrer Maintenant
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="group px-8 py-4 rounded-full text-lg font-semibold border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                        Voir plus
                        <Play className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-8 text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">40+</span>
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">Étudiants</div>
                          <div className="text-sm">Nous font confiance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <Excellence />
              <TrainingGrid />

              {/* Stats Section */}
              <section className="py-24 bg-blue-600">
                <div className="container mx-auto px-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                        <div className="text-blue-100">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <Gallery />

              {/* Testimonials */}
              <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
                      Ce Que Disent
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"> Nos Étudiants</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Découvrez les retours d'expérience de nos anciens étudiants
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{testimonial.name}</h3>
                            <p className="text-gray-600 text-sm">{testimonial.role}</p>
                            <p className="text-blue-600 text-sm">{testimonial.company}</p>
                          </div>
                        </div>
                        <p className="text-gray-600">{testimonial.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <Motto />

              <Footer />
            </>
          } />
          <Route path="/formations" element={<><Formations /><Footer /></>} />
          <Route path="/services" element={<><Services /><Footer /></>} />
          <Route path="/about" element={<><About /><Footer /></>} />
          <Route path="/training/:id" element={<><TrainingDetail /><Footer /></>} />
          <Route path="/contact" element={<><Contact /><Footer /></>} />
          <Route path="/blog" element={<><Blog /><Footer /></>} />
          <Route path="/conference-registration" element={<><ConferenceRegistration /><Footer /></>} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;