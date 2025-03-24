// Fonction pour charger une image depuis un fichier et la convertir en base64
const loadImageAsBase64 = async (imagePath: string): Promise<string> => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erreur lors du chargement de l\'image:', error);
    return '';
  }
};

// Image par défaut en base64 (1x1 pixel transparent)
const DEFAULT_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

let logoBase64 = DEFAULT_IMAGE;

// Fonction d'initialisation du logo
export const initializeLogo = async () => {
  const base64 = await loadImageAsBase64('/DA_LOGO-cc.png');
  if (base64) {
    logoBase64 = base64;
  }
  return logoBase64;
};

// Fonction pour obtenir le logo actuel
export const getLogo = () => logoBase64;

export const LOGO_BASE64 = DEFAULT_IMAGE;
export const SIGNATURE_BASE64 = DEFAULT_IMAGE;

// Fonction utilitaire pour convertir une image en base64
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}; 