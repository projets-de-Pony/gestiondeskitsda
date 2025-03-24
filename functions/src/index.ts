import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface CreateFirstAdminData {
  superAdminCode: string;
  email: string;
  password: string;
  name: string;
}

const SUPER_ADMIN_CODE = 'SITEDA2025SUPER';

export const createFirstAdmin = functions.https.onCall(async (data: CreateFirstAdminData, context: functions.https.CallableContext) => {
  console.log('Début de la création du premier admin');
  
  try {
    // Vérifier le code super admin
    if (data.superAdminCode !== SUPER_ADMIN_CODE) {
      console.log('Code super admin incorrect');
      throw new functions.https.HttpsError(
        'permission-denied',
        'Code super admin incorrect'
      );
    }

    // Vérifier les données requises
    if (!data.email || !data.password || !data.name) {
      console.log('Données manquantes:', { 
        hasEmail: !!data.email, 
        hasPassword: !!data.password, 
        hasName: !!data.name 
      });
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email, mot de passe et nom requis'
      );
    }

    // Vérifier s'il existe déjà un admin
    console.log('Vérification de l\'existence d\'un admin');
    const adminSnapshot = await admin
      .firestore()
      .collection('admins')
      .limit(1)
      .get();

    if (!adminSnapshot.empty) {
      console.log('Un admin existe déjà');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Un administrateur existe déjà'
      );
    }

    // Créer l'utilisateur
    console.log('Création de l\'utilisateur dans Authentication');
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
    });

    // Définir les claims admin
    console.log('Attribution des claims admin');
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      superAdmin: true,
    });

    // Créer le document admin dans Firestore
    console.log('Création du document admin dans Firestore');
    await admin.firestore().collection('admins').doc(userRecord.uid).set({
      email: data.email,
      name: data.name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isSuperAdmin: true,
    });

    // Logger la création
    console.log('Création du log admin');
    await admin.firestore().collection('admin_logs').add({
      action: 'CREATE_FIRST_ADMIN',
      adminId: userRecord.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        email: data.email,
        name: data.name,
      },
    });

    console.log('Premier admin créé avec succès');
    return {
      success: true,
      message: 'Premier administrateur créé avec succès',
      uid: userRecord.uid,
    };
  } catch (error) {
    console.error('Erreur lors de la création du premier admin:', error);
    if (error instanceof Error) {
      throw new functions.https.HttpsError(
        'internal',
        'Erreur lors de la création du premier administrateur: ' + error.message
      );
    } else {
      throw new functions.https.HttpsError(
        'internal',
        'Une erreur inconnue est survenue'
      );
    }
  }
});

export const setAdminClaims = functions.https.onCall(async (data: { uid: string }, context) => {
  console.log('Début de la configuration des claims admin');
  
  try {
    const uid = data.uid;
    
    if (!uid) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'UID requis'
      );
    }

    // Définir les claims admin
    console.log('Attribution des claims admin pour:', uid);
    await admin.auth().setCustomUserClaims(uid, {
      admin: true,
      superAdmin: true,
    });

    console.log('Claims admin définis avec succès');
    return {
      success: true,
      message: 'Claims admin définis avec succès',
    };
  } catch (error) {
    console.error('Erreur lors de la définition des claims admin:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Une erreur est survenue lors de la définition des claims admin'
    );
  }
});

export const setInitialAdminClaims = functions.https.onRequest(async (req, res) => {
  const uid = 'IfoaCKUw0PYxh7txjfv3SVDGsOp2'; // UID spécifique de l'admin 

  try {
    // Vérifier si l'utilisateur existe
    await admin.auth().getUser(uid);

    // Définir les claims admin
    await admin.auth().setCustomUserClaims(uid, {
      admin: true,
      superAdmin: true
    });

    res.json({
      success: true,
      message: 'Claims admin définis avec succès pour ' + uid
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la définition des claims admin'
    });
  }
});

//