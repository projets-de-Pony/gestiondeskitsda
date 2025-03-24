import { collection, addDoc, query, where, getDocs, doc, updateDoc, Timestamp, getDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StarlinkInvoice } from '../types/starlink';
import { formatPrice } from '../utils/formatters';
import { calculateFCFAAmount } from './starlinkService';
import { LOGO_BASE64, SIGNATURE_BASE64 } from '../utils/imageUtils';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { configurePdfMake, isPdfMakeConfigured } from '../config/pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { initializeLogo, getLogo } from '../utils/imageUtils';

const COLLECTION_NAME = 'invoices';

class InvoiceService {
  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 5);
    return `INV-${timestamp}-${randomStr}`.toUpperCase();
  }

  async createInvoice(data: Omit<StarlinkInvoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, userId: string): Promise<StarlinkInvoice> {
    try {
      if (!data.clientId || !userId) {
        throw new Error('ClientId et userId sont requis pour créer une facture');
      }

      console.log('InvoiceService - Création d\'une nouvelle facture:', { data, userId });

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const existingInvoices = await getDocs(
        query(
          collection(db, 'starlink_invoices'),
          where('createdAt', '>=', new Date(today.setHours(0, 0, 0, 0))),
          orderBy('createdAt', 'desc')
        )
      );
      const invoiceNumber = `${dateStr}-${(existingInvoices.size + 1).toString().padStart(3, '0')}`;

      const amount = data.originalAmount 
        ? calculateFCFAAmount(data.originalAmount.amount, data.originalAmount.currency)
        : data.amount;

      const invoiceData = {
        ...data,
        invoiceNumber,
        amount,
        currency: 'XOF',
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        updatedBy: userId
      };

      console.log('InvoiceService - Données de la facture préparées:', invoiceData);

      const docRef = await addDoc(collection(db, 'starlink_invoices'), invoiceData);
      console.log('InvoiceService - Facture créée avec succès, ID:', docRef.id);
      
      return {
        ...invoiceData,
        id: docRef.id,
        createdAt: invoiceData.createdAt.toDate(),
        updatedAt: invoiceData.updatedAt.toDate(),
        dueDate: data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate)
      } as unknown as StarlinkInvoice;
    } catch (error) {
      console.error('InvoiceService - Erreur lors de la création de la facture:', error);
      throw new Error('Erreur lors de la création de la facture');
    }
  } 

  async getClientInvoices(clientId: string): Promise<StarlinkInvoice[]> {
    try {
      if (!clientId) {
        throw new Error('ClientId est requis pour récupérer les factures');
      }

      console.log('InvoiceService - Récupération des factures pour le client:', clientId);

      const q = query(
        collection(db, 'starlink_invoices'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );

      console.log('InvoiceService - Exécution de la requête...');
      const querySnapshot = await getDocs(q);
      console.log('InvoiceService - Nombre de factures trouvées:', querySnapshot.size);

      const invoices = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || new Date(),
          paidAt: data.paidAt ? data.paidAt.toDate() : null
        } as unknown as StarlinkInvoice;
      });

      console.log('InvoiceService - Factures transformées:', invoices);
      return invoices;
    } catch (error) {
      console.error('InvoiceService - Erreur lors de la récupération des factures:', error);
      throw new Error('Erreur lors de la récupération des factures');
    }
  }

  async updateInvoiceStatus(invoiceId: string, status: StarlinkInvoice['status'], userId: string): Promise<void> {
    try {
      if (!invoiceId || !status || !userId) {
        throw new Error('InvoiceId, status et userId sont requis pour mettre à jour le statut');
      }

      console.log('InvoiceService - Mise à jour du statut de la facture:', { invoiceId, status, userId });

      const docRef = doc(db, 'starlink_invoices', invoiceId);
      const updateData = {
        status,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
        ...(status === 'paid' ? { paidAt: Timestamp.now() } : {})
      };

      await updateDoc(docRef, updateData);
      console.log('InvoiceService - Statut de la facture mis à jour avec succès');
    } catch (error) {
      console.error('InvoiceService - Erreur lors de la mise à jour du statut:', error);
      throw new Error('Erreur lors de la mise à jour du statut');
    }
  }

  async updateInvoice(
    invoiceId: string,
    data: Partial<Omit<StarlinkInvoice, 'id' | 'invoiceNumber' | 'createdAt' | 'createdBy'>>,
    userId: string
  ): Promise<void> {
    try {
      if (!invoiceId || !userId) {
        throw new Error('InvoiceId et userId sont requis pour mettre à jour une facture');
      }

      console.log('InvoiceService - Mise à jour de la facture:', { invoiceId, data, userId });

      const docRef = doc(db, 'starlink_invoices', invoiceId);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
        updatedBy: userId
      };

      await updateDoc(docRef, updateData);
      console.log('InvoiceService - Facture mise à jour avec succès');
    } catch (error) {
      console.error('InvoiceService - Erreur lors de la mise à jour de la facture:', error);
      throw new Error('Erreur lors de la mise à jour de la facture');
    }
  }

  async getInvoiceById(invoiceId: string): Promise<StarlinkInvoice | null> {
    try {
      console.log('InvoiceService - Récupération de la facture:', invoiceId);
      
      const docRef = doc(db, 'starlink_invoices', invoiceId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log('InvoiceService - Facture non trouvée');
        return null;
      }

      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || new Date(),
        paidAt: data.paidAt ? data.paidAt.toDate() : null
      } as unknown as StarlinkInvoice;
    } catch (error) {
      console.error('InvoiceService - Erreur lors de la récupération de la facture:', error);
      throw new Error('Erreur lors de la récupération de la facture');
    }
  }

  async generateInvoicePDF(invoice: StarlinkInvoice): Promise<void> {
    try {
      if (!isPdfMakeConfigured()) {
        const configured = configurePdfMake();
        if (!configured) {
          throw new Error('Impossible de configurer pdfMake');
        }
      }

      // Initialiser le logo
      await initializeLogo();
      const logoData = getLogo();

      const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageMargins: [20, 20, 20, 20],
        content: [
          {
            stack: [
              {
                image: logoData,
                width: 100,
                alignment: 'center',
                margin: [0, 0, 0, 20]
              },
              {
                columns: [
                  {
                    width: '*',
                    stack: [
                      { text: 'DIGITAL ACADEMY', style: 'header' },
                      { text: 'DOUALA, Cameroun', style: 'subheader' },
                      { text: 'TOTAL BEPANDA 2 RUE EN PAVEE 07 ème DODANNES', style: 'subheader' },
                      { text: 'digitalacademy@gmail.com', style: 'subheader' },
                      { text: '+237 6 55 85 33 48 - +237 6 50 43 95 03', style: 'subheader' },
                      { text: 'N° Contribuable: PO79916420235K', style: 'subheader' },
                      { text: 'Compte bancaire: 10005 00020 08388581101 44', style: 'subheader' }
                    ]
                  },
                  {
                    width: 'auto',
                    stack: [
                      { text: 'FACTURE', style: 'invoiceTitle', alignment: 'right' },
                      { text: `N° ${invoice.invoiceNumber}`, style: 'invoiceNumber', alignment: 'right' },
                      { text: `Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, style: 'invoiceDetails', alignment: 'right' },
                      { text: `Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, style: 'invoiceDetails', alignment: 'right' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            margin: [0, 20, 0, 0],
            table: {
              widths: ['*'],
              body: [[{
                stack: [
                  { text: 'INFORMATIONS CLIENT', style: 'sectionHeader' },
                  { text: invoice.clientName, style: 'clientName' },
                  { text: invoice.clientEmail || '', style: 'clientDetails' },
                  { text: invoice.clientPhone || '', style: 'clientDetails' },
                  { text: `Kit: ${invoice.kitNumber || ''}`, style: 'clientDetails' }
                ],
                fillColor: '#f8fafc'
              }]]
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
              paddingTop: () => 10,
              paddingBottom: () => 10,
              paddingLeft: () => 10,
              paddingRight: () => 10
            }
          },
          {
            margin: [0, 20, 0, 0],
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Description', style: 'tableHeader' },
                  { text: 'Quantité', style: 'tableHeader', alignment: 'center' },
                  { text: 'Prix unitaire', style: 'tableHeader', alignment: 'right' },
                  { text: 'Total', style: 'tableHeader', alignment: 'right' }
                ],
                ...invoice.items.map(item => [
                  { text: item.description, style: 'tableCell' },
                  { text: item.quantity.toString(), style: 'tableCell', alignment: 'center' },
                  { 
                    text: formatPrice(
                      Number((invoice.originalAmount?.amount || invoice.amount) / item.quantity),
                      invoice.originalAmount?.currency || invoice.currency
                    ),
                    style: 'tableCell',
                    alignment: 'right'
                  },
                  { 
                    text: formatPrice(
                      Number(invoice.originalAmount?.amount || invoice.amount),
                      invoice.originalAmount?.currency || invoice.currency
                    ),
                    style: 'tableCell',
                    alignment: 'right'
                  }
                ])
              ]
            },
            layout: {
              hLineWidth: (i: number, node: { table: { body: any[] } }) => (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 0,
              vLineWidth: () => 0,
              hLineColor: () => '#e2e8f0',
              paddingTop: () => 8,
              paddingBottom: () => 8,
              fillColor: (rowIndex: number) => (rowIndex === 0) ? '#f8fafc' : ((rowIndex % 2 === 0) ? '#f8fafc' : null)
            }
          },
          {
            margin: [0, 20, 0, 0],
            table: {
              widths: ['*', 150],
              body: [
                [
                  { text: 'Total', style: 'totalLabel', alignment: 'right' },
                  { 
                    text: invoice.originalAmount 
                      ? formatPrice(Number(invoice.originalAmount.amount.toFixed(2)), invoice.originalAmount.currency)
                      : formatPrice(Number(invoice.amount.toFixed(2)), invoice.currency),
                    style: 'totalAmount',
                    alignment: 'right'
                  }
                ],
                ...(invoice.originalAmount ? [[
                  { text: 'Équivalent FCFA', style: 'totalLabel', alignment: 'right' },
                  {
                    text: formatPrice(Number(invoice.amount.toFixed(2)), 'XOF'),
                    style: 'totalAmount',
                    alignment: 'right'
                  }
                ]] : [])
              ]
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
              paddingTop: () => 4,
              paddingBottom: () => 4
            }
          },
          {
            margin: [0, 20, 0, 0],
            table: {
              widths: ['*'],
              body: [[{
                stack: [
                  { text: 'Conditions de paiement', style: 'termsHeader' },
                  { 
                    ul: [
                      'Paiement dû dans les 03 jours suivant la réception de la facture',
                      'Tout retard de paiement entraînera une suspension du service',
                      'Pour toute question, contactez notre service client'
                    ],
                    style: 'terms'
                  }
                ],
                fillColor: '#f8fafc'
              }]]
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
              paddingTop: () => 10,
              paddingBottom: () => 10,
              paddingLeft: () => 10,
              paddingRight: () => 10
            }
          },
          {
            columns: [
              {
                width: '*',
                stack: [
                  { text: 'Digital Academy', style: 'signatureLabel', alignment: 'center' },
                  { text: '_____________________', style: 'signatureLine', alignment: 'center' }
                ]
              },
              {
                width: '*',
                stack: [
                  { text: 'Client', style: 'signatureLabel', alignment: 'center' },
                  { text: '_____________________', style: 'signatureLine', alignment: 'center' }
                ]
              }
            ],
            margin: [0, 30, 0, 0]
          }
        ],
        defaultStyle: {
          font: 'Roboto'
        },
        styles: {
          header: {
            fontSize: 20,
            bold: true,
            color: '#2563eb',
            margin: [0, 0, 0, 2]
          },
          subheader: {
            fontSize: 9,
            color: '#64748b',
            margin: [0, 1, 0, 0]
          },
          invoiceTitle: {
            fontSize: 24,
            bold: true,
            color: '#2563eb',
            margin: [0, 0, 0, 5]
          },
          invoiceNumber: {
            fontSize: 11,
            bold: true,
            color: '#1e293b',
            margin: [0, 0, 0, 3]
          },
          invoiceDetails: {
            fontSize: 10,
            color: '#64748b',
            margin: [0, 0, 0, 2]
          },
          sectionHeader: {
            fontSize: 11,
            bold: true,
            color: '#64748b',
            margin: [0, 0, 0, 5]
          },
          clientName: {
            fontSize: 13,
            bold: true,
            color: '#1e293b',
            margin: [0, 5, 0, 3]
          },
          clientDetails: {
            fontSize: 10,
            color: '#64748b',
            margin: [0, 2, 0, 2]
          },
          tableHeader: {
            fontSize: 10,
            bold: true,
            color: '#1e293b'
          },
          tableCell: {
            fontSize: 10,
            color: '#64748b'
          },
          totalLabel: {
            fontSize: 11,
            bold: true,
            color: '#1e293b'
          },
          totalAmount: {
            fontSize: 11,
            bold: true,
            color: '#2563eb'
          },
          termsHeader: {
            fontSize: 11,
            bold: true,
            color: '#1e293b',
            margin: [0, 0, 0, 5]
          },
          terms: {
            fontSize: 9,
            color: '#64748b',
            margin: [0, 0, 0, 0]
          },
          signatureLabel: {
            fontSize: 10,
            color: '#1e293b',
            margin: [0, 0, 0, 5]
          },
          signatureLine: {
            fontSize: 10,
            color: '#94a3b8'
          }
        }
      } as TDocumentDefinitions;

      return new Promise<void>((resolve, reject) => {
        try {
          const pdfDocGenerator = pdfMake.createPdf(docDefinition);
          pdfDocGenerator.getBuffer((buffer) => {
            try {
              const blob = new Blob([buffer], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.target = '_blank';
              link.style.display = 'none';
              document.body.appendChild(link);

              try {
                link.click();
                setTimeout(() => {
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                }, 100);
                resolve();
              } catch (error) {
                window.location.href = url;
                resolve();
              }
            } catch (error) {
              console.error('Erreur lors de la création du blob PDF:', error);
              reject(error);
            }
          });
        } catch (error) {
          console.error('Erreur lors de la génération du buffer PDF:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new Error('Erreur lors de la génération du PDF: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    try {
      if (!invoiceId) {
        throw new Error('InvoiceId est requis pour supprimer une facture');
      }

      console.log('InvoiceService - Suppression de la facture:', invoiceId);
      
      const docRef = doc(db, 'starlink_invoices', invoiceId);
      await deleteDoc(docRef);
      
      console.log('InvoiceService - Facture supprimée avec succès');
    } catch (error) {
      console.error('InvoiceService - Erreur lors de la suppression de la facture:', error);
      throw new Error('Erreur lors de la suppression de la facture');
    }
  }
}

export const invoiceService = new InvoiceService(); 
//mr