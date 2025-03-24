import { collection, addDoc, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MaintenanceRecord, TechnicalIssue, KitReplacement } from '../types/starlink';

export const maintenanceService = {
  async createMaintenance(data: Partial<MaintenanceRecord>, clientId: string, userId: string) {
    try {
      const maintenanceData = {
        ...data,
        clientId,
        scheduledDate: Timestamp.fromDate(new Date(data.scheduledDate as string)),
        completedDate: data.completedDate ? Timestamp.fromDate(new Date(data.completedDate)) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        updatedBy: userId
      };

      const docRef = await addDoc(collection(db, 'maintenance_records'), maintenanceData);
      
      const clientRef = doc(db, 'starlink_clients', clientId);
      const clientDoc = await getDoc(clientRef);
      const clientData = clientDoc.data();
      
      await updateDoc(clientRef, {
        maintenanceRecords: [...(clientData?.maintenanceRecords || []), { ...maintenanceData, id: docRef.id }],
        updatedAt: Timestamp.now(),
        updatedBy: userId
      });

      return { id: docRef.id, ...maintenanceData };
    } catch (error) {
      console.error('Erreur lors de la création de la maintenance:', error);
      throw error;
    }
  },

  async createTechnicalIssue(data: Partial<TechnicalIssue>, clientId: string, userId: string) {
    try {
      const issueData = {
        ...data,
        clientId,
        reportedAt: Timestamp.now(),
        resolvedAt: data.status === 'resolved' ? Timestamp.now() : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        updatedBy: userId
      };

      const docRef = await addDoc(collection(db, 'technical_issues'), issueData);
      
      const clientRef = doc(db, 'starlink_clients', clientId);
      const clientDoc = await getDoc(clientRef);
      const clientData = clientDoc.data();
      
      await updateDoc(clientRef, {
        technicalIssues: [...(clientData?.technicalIssues || []), { ...issueData, id: docRef.id }],
        updatedAt: Timestamp.now(),
        updatedBy: userId
      });

      return { id: docRef.id, ...issueData };
    } catch (error) {
      console.error('Erreur lors de la création du problème technique:', error);
      throw error;
    }
  },

  async createKitReplacement(data: Partial<KitReplacement>, clientId: string, userId: string) {
    try {
      const replacementData = {
        ...data,
        clientId,
        replacementDate: Timestamp.fromDate(new Date(data.replacementDate as string)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        updatedBy: userId
      };

      const docRef = await addDoc(collection(db, 'kit_replacements'), replacementData);
      
      const clientRef = doc(db, 'starlink_clients', clientId);
      const clientDoc = await getDoc(clientRef);
      const clientData = clientDoc.data();
      
      await updateDoc(clientRef, {
        kitReplacements: [...(clientData?.kitReplacements || []), { ...replacementData, id: docRef.id }],
        kitNumber: data.status === 'completed' ? data.newKitNumber : clientData?.kitNumber,
        updatedAt: Timestamp.now(),
        updatedBy: userId
      });

      return { id: docRef.id, ...replacementData };
    } catch (error) {
      console.error('Erreur lors de la création du remplacement de kit:', error);
      throw error;
    }
  }
}; 