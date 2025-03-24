import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configuration de pdfMake
export function configurePdfMake() {
  try {
    console.log('Configuration de pdfMake - Début');
    
    // Forcer l'initialisation du VFS directement depuis pdfFonts
    console.log('Configuration du VFS pour pdfMake');
    if (typeof pdfFonts === 'object' && pdfFonts !== null) {
      // @ts-ignore
      pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;
    } else {
      console.error('pdfFonts n\'est pas un objet valide');
      return false;
    }
    
    // Configuration des polices par défaut
    console.log('Configuration des polices pour pdfMake');
    pdfMake.fonts = {
      Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
      }
    };

    console.log('Configuration de pdfMake - Terminée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la configuration de pdfMake:', error);
    return false;
  }
}

// Fonction pour vérifier si pdfMake est correctement configuré
export function isPdfMakeConfigured(): boolean {
  try {
    // @ts-ignore
    return !!(pdfMake.vfs && pdfMake.fonts && Object.keys(pdfMake.fonts).length > 0);
  } catch (error) {
    console.error('Erreur lors de la vérification de la configuration de pdfMake:', error);
    return false;
  }
} 