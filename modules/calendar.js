/* modules/calendar.js - Módulo de Agenda */

export default class CalendarService {
    static getAppointments(date) {
        // Por ahora retorna datos de prueba
        // En producción vendrían de una base de datos
        return [
            {
                id: 1,
                patientId: 'V-12345678',
                patientName: 'Juan Pérez',
                time: '09:00',
                reason: 'Control post-operatorio',
                status: 'confirmed'
            },
            {
                id: 2,
                patientId: 'V-87654321',
                patientName: 'María González',
                time: '10:30',
                reason: 'Dolor de garganta',
                status: 'pending'
            }
        ];
    }

    static addAppointment(appointment) {
        // Guardar en localStorage temporalmente
        const appointments = JSON.parse(localStorage.getItem('cima_appointments') || '[]');
        appointments.push({
            ...appointment,
            id: Date.now(),
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('cima_appointments', JSON.stringify(appointments));
    }

    static updateAppointment(id, updates) {
        let appointments = JSON.parse(localStorage.getItem('cima_appointments') || '[]');
        appointments = appointments.map(app => 
            app.id === id ? { ...app, ...updates } : app
        );
        localStorage.setItem('cima_appointments', JSON.stringify(appointments));
    }

    static deleteAppointment(id) {
        let appointments = JSON.parse(localStorage.getItem('cima_appointments') || '[]');
        appointments = appointments.filter(app => app.id !== id);
        localStorage.setItem('cima_appointments', JSON.stringify(appointments));
    }

    static getAppointmentsForDate(date) {
        const appointments = JSON.parse(localStorage.getItem('cima_appointments') || '[]');
        const targetDate = date.toISOString().split('T')[0];
        
        return appointments.filter(app => {
            const appDate = app.date ? app.date.split('T')[0] : 
                           new Date(app.createdAt).toISOString().split('T')[0];
            return appDate === targetDate;
        });
    }
}
