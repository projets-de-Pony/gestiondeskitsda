import { Training } from '../types';

export const trainings: Training[] = [
  {
    id: 'nocode-web-dev',
    title: 'Développement Web No-Code',
    description: 'Apprenez à créer des sites web professionnels sans écrire une seule ligne de code. Formation idéale pour les entrepreneurs, marketeurs et créatifs.',
    price: 250000,
    duration: '8 semaines',
    format: 'hybride',
    level: 'Débutant',
    startDate: '2024-04-15',
    category: 'No-Code',
    image: '/formationcode.jpg',
    modules: [
      {
        title: 'Introduction au No-Code',
        duration: '1 semaine',
        topics: [
          'Comprendre l\'écosystème No-Code',
          'Avantages et limitations du No-Code',
          'Panorama des outils No-Code'
        ]
      },
      {
        title: 'Webflow Fondamentaux',
        duration: '2 semaines',
        topics: [
          'Interface et navigation',
          'Design responsive',
          'Composants et styles'
        ]
      },
      {
        title: 'Création de Sites Dynamiques',
        duration: '2 semaines',
        topics: [
          'Collections et CMS',
          'Filtres et recherche',
          'Formulaires et interactions'
        ]
      },
      {
        title: 'E-commerce avec Webflow',
        duration: '2 semaines',
        topics: [
          'Configuration de la boutique',
          'Gestion des produits',
          'Paiements et livraison'
        ]
      },
      {
        title: 'Projet Final',
        duration: '1 semaine',
        topics: [
          'Création d\'un site complet',
          'Déploiement',
          'SEO et optimisation'
        ]
      }
    ]
  },
  {
    id: 'ecommerce-chine',
    title: 'E-commerce 2025: Import-Export Chine-Cameroun',
    description: 'Maîtrisez l\'art de l\'importation et de la revente au Cameroun. Formation complète sur la recherche de produits, la négociation avec les fournisseurs chinois et la commercialisation locale.',
    price: 300000,
    duration: '10 semaines',
    format: 'hybride',
    level: 'Intermédiaire',
    startDate: '2024-05-01',
    category: 'E-commerce',
    image: '/formationec.jpg',
    modules: [
      {
        title: 'Fondamentaux du Commerce Chine-Cameroun',
        duration: '2 semaines',
        topics: [
          'Comprendre le marché chinois',
          'Analyse du marché camerounais',
          'Réglementations et douanes'
        ]
      },
      {
        title: 'Sourcing et Négociation',
        duration: '2 semaines',
        topics: [
          'Utilisation d\'Alibaba et autres plateformes',
          'Techniques de négociation avec les fournisseurs',
          'Contrôle qualité et échantillonnage'
        ]
      },
      {
        title: 'Logistique et Import',
        duration: '2 semaines',
        topics: [
          'Transport et expédition',
          'Dédouanement au Cameroun',
          'Gestion des stocks'
        ]
      },
      {
        title: 'Commercialisation Locale',
        duration: '2 semaines',
        topics: [
          'Stratégies de pricing',
          'Canaux de distribution',
          'Service client'
        ]
      },
      {
        title: 'Marketing et Vente',
        duration: '2 semaines',
        topics: [
          'Marketing digital local',
          'Gestion des réseaux sociaux',
          'Techniques de vente efficaces'
        ]
      }
    ]
  },
  {
    id: 'digital-marketing',
    title: 'Marketing Digital Avancé: Facebook & Instagram Ads',
    description: 'Optimisez vos campagnes publicitaires sur Facebook et Instagram. Apprenez à générer des ventes sans gaspiller votre budget publicitaire.',
    price: 200000,
    duration: '6 semaines',
    format: 'video',
    level: 'Intermédiaire',
    startDate: '2024-04-20',
    category: 'Marketing Digital',
    image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    modules: [
      {
        title: 'Fondamentaux du Marketing Digital',
        duration: '1 semaine',
        topics: [
          'Écosystème Facebook & Instagram',
          'Business Manager et Pixel',
          'Analyse de votre marché cible'
        ]
      },
      {
        title: 'Structure des Campagnes',
        duration: '1 semaine',
        topics: [
          'Architecture des campagnes',
          'Segmentation des audiences',
          'Création de contenu performant'
        ]
      },
      {
        title: 'Optimisation du Budget',
        duration: '1 semaine',
        topics: [
          'Stratégies d\'enchères',
          'Tests A/B',
          'Optimisation des coûts'
        ]
      },
      {
        title: 'Retargeting Avancé',
        duration: '1 semaine',
        topics: [
          'Audiences personnalisées',
          'Séquences de retargeting',
          'Optimisation des conversions'
        ]
      },
      {
        title: 'Analytics et Scaling',
        duration: '2 semaines',
        topics: [
          'Analyse des performances',
          'Scaling des campagnes rentables',
          'Automatisation et reporting'
        ]
      }
    ]
  }
];