import { Cloudinary } from '@cloudinary/url-gen';
import { scale, fill } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/quality';

// Initialiser Cloudinary
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  },
  url: {
    secure: true
  }
});

export const cloudinaryService = {
  // Générer une URL optimisée pour les vignettes de produits
  getProductThumbnail(publicId: string) {
    return cld
      .image(publicId)
      .resize(fill().width(400).height(300))
      .delivery(format('auto'))
      .delivery(quality(auto()))
      .toURL();
  },

  // Générer une URL optimisée pour les images de catégories
  getCategoryImage(publicId: string) {
    return cld
      .image(publicId)
      .resize(scale().width(800))
      .delivery(format('auto'))
      .delivery(quality(auto()))
      .toURL();
  },

  // Générer une URL optimisée pour les images détaillées de produits
  getProductDetailImage(publicId: string) {
    return cld
      .image(publicId)
      .resize(scale().width(1200))
      .delivery(format('auto'))
      .delivery(quality(auto()))
      .toURL();
  },

  // Générer une URL pour une image avec des dimensions personnalisées
  getCustomImage(publicId: string, width: number, height?: number) {
    let transform = cld.image(publicId);
    
    if (height) {
      transform = transform.resize(fill().width(width).height(height));
    } else {
      transform = transform.resize(scale().width(width));
    }
    
    return transform
      .delivery(format('auto'))
      .delivery(quality(auto()))
      .toURL();
  },

  // Upload une image vers Cloudinary
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'produits');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement de l\'image');
      }

      const data = await response.json();
      return data.public_id;
    } catch (error) {
      console.error('Erreur d\'upload:', error);
      throw error;
    }
  }
}; 