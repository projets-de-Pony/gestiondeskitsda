import React, { useState } from 'react';
import { cloudinaryService } from '../services/cloudinaryService';
import { ImageOff } from 'lucide-react';

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  type?: 'product' | 'category' | 'detail' | 'custom';
  width?: number;
  height?: number;
  className?: string;
}

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  publicId,
  alt,
  type = 'product',
  width,
  height,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const getImageUrl = () => {
    switch (type) {
      case 'product':
        return cloudinaryService.getProductThumbnail(publicId);
      case 'category':
        return cloudinaryService.getCategoryImage(publicId);
      case 'detail':
        return cloudinaryService.getProductDetailImage(publicId);
      case 'custom':
        return cloudinaryService.getCustomImage(publicId, width || 400, height);
      default:
        return cloudinaryService.getProductThumbnail(publicId);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Image principale */}
      <img
        src={getImageUrl()}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading || hasError ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* État de chargement */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {/* État d'erreur */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
          <ImageOff className="w-8 h-8 mb-2" />
          <span className="text-sm">Image non disponible</span>
        </div>
      )}
    </div>
  );
};

export default CloudinaryImage; 