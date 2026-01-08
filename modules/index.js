/* modules/index.js */

/*
  [GLOSARIO-INDEX]
  StorageService -> Persistencia Local
  PatientFieldConfig -> Esquema completo del paciente (A-R)
  App -> Orquestador principal (Dashboard, Paciente, Modal)
*/

import UserProfile from './user-profile.js';
import PatientProfile from './patient-profile.js';

// [JS-IND-001] SERVICIO DE ALMACENAMIENTO
class StorageService {
  static BASE_KEY = 'CIMA_STORAGE_V3';

  static savePatient(profile) {
    const db = this._getDB();
    const key = profile.identificacion.documento_numero;
    if (!key) throw new Error("Documento requerido");
    db.patients[key] = profile;
    this._saveDB(db);
  }

  static getPatient(docId) {
    return this._getDB().patients[docId] || null;
  }

  static saveConsultation(docId, consultationData) {
    const db = this._getDB();
    if (!db.consultations[docId]) db.consultations[docId] = [];
    
    // [FIX FINAL CRÍTICO] Si no hay usuario, crear uno fantasma por defecto
    const currentUser = window.currentUser || { id: 'U-001' };

    if (consultationData.id) {
        const idx = db.consultations[docId].findIndex(c => c.id === consultationData.id);
        if (idx !== -1) {
            const existing = db.consultations[docId][idx];
            db.consultations[docId][idx] = { ...existing, ...consultationData, updatedAt: new Date().toISOString(), createdBy: currentUser.id };
        }
    } else {
        // Nueva
        consultationData.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        consultationData.createdAt = new Date().toISOString();
        consultationData.createdBy = currentUser.id;
        db.consultations[docId].push(consultationData);
    }
    this._saveDB(db);
  }

  static getConsultations(docId) {
    const db = this._getDB();
    return (db.consultations[docId] || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static search(query) {
    const db = this._getDB();
    const q = query.toLowerCase();
    return Object.values(db.patients).filter(p =>
