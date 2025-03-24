import React from 'react';
import { ArrowRight, Play, User } from 'lucide-react';

const stats = [
  { value: '40+', label: 'Étudiants' },
  { value: '5+', label: 'Formations' },
  { value: '95%', label: 'Satisfaction' },
  { value: '24/7', label: 'Support' }
];

const Home = () => {
  return (
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
    </>
  );
};

export default Home; 