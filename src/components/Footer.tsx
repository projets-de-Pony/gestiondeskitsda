import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-xl">
                <img 
                  src="/DA_LOGO.png" 
                  alt="Digital Academy Logo" 
                  className="h-8 w-auto"
                />
              </div>
            </div>
            <p className="text-gray-600">
              Formez-vous aux métiers du numérique avec les meilleurs experts du domaine.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/digitalacademy237" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/digitalacademy237" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@digitalacademy237" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-900">Liens Rapides</h3>
            <ul className="space-y-4">
              {['Formations', 'À Propos', 'Blog', 'Contact'].map((item, index) => (
                <li key={index}>
                  <Link to={`/${item.toLowerCase()}`} className="text-gray-600 hover:text-blue-600 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Formations */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-900">Nos Formations</h3>
            <ul className="space-y-4">
              {[
                'Développement Web',
                'Intelligence Artificielle',
                'UX/UI Design',
                'Marketing Digital'
              ].map((item, index) => (
                <li key={index}>
                  <Link to="/formations" className="text-gray-600 hover:text-blue-600 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-900">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5 text-blue-600" />
                contact@digital-academy237.com
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5 text-blue-600" />
                +237 6 50 43 95 03
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-blue-600" />
                BP CITE AVANT LES FEUX ROUGE, DOUALA CAMEROUN
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © 2025 Digital Academy. Tous droits réservés developpé par PONY VICTOR.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Mentions Légales
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Politique de Confidentialité
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                CGV
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;