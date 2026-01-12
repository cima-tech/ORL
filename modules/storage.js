/* modules/storage.js - Servicio de almacenamiento mejorado */
class StorageService {
    static BASE_KEY = 'CIMA_STORAGE_V3';
    static BUZON_KEY = 'CIMA_BUZON_V1';
    static CONFIG_KEY = 'CIMA_CONFIG_V1';
    
    // ... (mantener todos los métodos originales de tu StorageService)
    // Solo añadiré el método para el buzon
    
    static addToBuzon(patientData) {
        const buzon = this._getBuzon();
        const id = 'buzon_' + Date.now();
        
        // Asegurar que tenga estructura básica
        patientData.id = id;
        patientData.createdAt = new Date().toISOString();
        patientData.status = 'pending';
        patientData.source = 'patient_form';
        
        buzon.push(patientData);
        this._saveBuzon(buzon);
        
        return id;
    }
    
    static getBuzon() {
        return this._getBuzon();
    }
    
    static removeFromBuzon(id) {
        let buzon = this._getBuzon();
        buzon = buzon.filter(p => p.id !== id);
        this._saveBuzon(buzon);
    }
    
    static _getBuzon() {
        const raw = localStorage.getItem(this.BUZON_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    
    static _saveBuzon(buzon) {
        localStorage.setItem(this.BUZON_KEY, JSON.stringify(buzon));
    }
    
    // Mantener todos los métodos originales...
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
        
        const currentUser = window.currentUser || { id: 'Guest' };
        
        if (consultationData.id) {
            const idx = db.consultations[docId].findIndex(c => c.id === consultationData.id);
            if (idx !== -1) {
                const existing = db.consultations[docId][idx];
                db.consultations[docId][idx] = { ...existing, ...consultationData, updatedAt: new Date().toISOString(), createdBy: currentUser.id };
            }
        } else {
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
        return Object.values(db.patients).filter(p => {
            const name = `${p.nombres.primer_nombre} ${p.nombres.primer_apellido}`.toLowerCase();
            return name.includes(q) || p.identificacion.documento_numero.includes(q);
        });
    }
    
    static _getDB() {
        const raw = localStorage.getItem(this.BASE_KEY);
        return raw ? JSON.parse(raw) : { patients: {}, consultations: {} };
    }
    
    static _saveDB(db) {
        localStorage.setItem(this.BASE_KEY, JSON.stringify(db));
    }
}

// Exportar para uso global
window.StorageService = StorageService;
export default StorageService;
