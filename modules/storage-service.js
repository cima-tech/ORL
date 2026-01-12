/* modules/storage-service.js - Servicio de almacenamiento optimizado */
class StorageService {
    static BASE_KEY = 'CIMA_STORAGE_V5';
    static BUZON_KEY = 'CIMA_BUZON_V2';
    
    // ... (implementación completa igual a la anterior pero optimizada)
    
    static addToBuzon(patientData) {
        const buzon = this.getBuzon();
        patientData.id = 'buzon_' + Date.now();
        patientData.timestamp = Date.now();
        buzon.push(patientData);
        localStorage.setItem(this.BUZON_KEY, JSON.stringify(buzon));
        return patientData.id;
    }
    
    static getBuzon() {
        const raw = localStorage.getItem(this.BUZON_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    
    static removeFromBuzon(index) {
        const buzon = this.getBuzon();
        if (index >= 0 && index < buzon.length) {
            buzon.splice(index, 1);
            localStorage.setItem(this.BUZON_KEY, JSON.stringify(buzon));
        }
    }
    
    // ... resto de métodos
}

export default StorageService;
