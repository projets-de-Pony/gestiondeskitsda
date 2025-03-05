import React from 'react';
import { ArrowRight, Clock, Users, Laptop } from 'lucide-react';
import { Training } from '../types';
import { Link } from 'react-router-dom';

interface TrainingCardProps {
  training: Training;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ training }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'video':
        return <Laptop className="w-5 h-5" />;
      case 'presentiel':
        return <Users className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={training.image}
          alt={training.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
            {training.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900">{training.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{training.description}</p>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            {training.duration}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            {getFormatIcon(training.format)}
            {training.format.charAt(0).toUpperCase() + training.format.slice(1)}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(training.price)}
          </span>
          <Link
            to={`/training/${training.id}`}
            className="group inline-flex items-center gap-2 bg-gray-100 hover:bg-blue-600 px-4 py-2 rounded-full text-gray-600 hover:text-white transition-all duration-300"
          >
            En savoir plus
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrainingCard;