import { $, $$, STATE, flash, showErr } from 'brain';
import { loadHistoryRecord, getSearchResults } from 'engine';

export const AgendaManager = {
    currentDate: new Date(),
    view: 'day', // 'day', 'week'

    init() {
        this.render();
    },

    changeView(v) {
        this.view = v;
        this.render();
    },

    render() {
        const container = document.getElementById('agenda-grid');
        if (!container) return;

        const dateStr = this.currentDate.toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        let html = `
            <div style="text-align:center; margin-bottom:20px; color:var(--accent); font-size:1.1rem; text-transform:capitalize;">
                <button class="icon-btn" style="display:inline-flex;" onclick="window.AgendaManager.shiftDate(-1)"><i class="bi bi-chevron-left"></i></button>
                <span style="margin:0 15px;">${dateStr}</span>
                <button class="icon-btn" style="display:inline-flex;" onclick="window.AgendaManager.shiftDate(1)"><i class="bi bi-chevron-right"></i></button>
            </div>
        `;

        if (this.view === 'day') {
            html += this.renderDayView();
        } else {
            html += `<div style="padding:50px; text-align:center; color:#64748b;">Vista Semanal en construcción (Requiere Cloudflare Backend)</div>`;
        }

        container.innerHTML = html;
    },

    renderDayView() {
        // Horas de 7am a 7pm
        const hours = Array.from({length: 13}, (_, i) => i + 7);
        const slots = hours.map(h => {
            const timeLabel = `${h}:00`.padStart(5, '0');
            // Mockup: Buscar cita en LocalStorage para esta hora
            const key = `CIMA_APT_${this.currentDate.toISOString().split('T')[0]}_${h}`;
            const apt = JSON.parse(localStorage.getItem(key));

            let content = '';
            if (apt) {
                content = `
                <div class="apt-card" onclick="window.AgendaManager.openPatientFromAgenda('${apt.patientId}')" style="background:var(--primary); padding:10px; border-radius:8px; cursor:pointer; color:white;">
                    <div style="font-weight:bold;">${apt.patientName}</div>
                    <div style="font-size:0.8rem;">${apt.motive}</div>
                    <div style="font-size:0.7rem; margin-top:5px; opacity:0.8;"><i class="bi bi-folder2-open"></i> Abrir Historia</div>
                </div>`;
            } else {
                content = `<div class="apt-empty" onclick="window.AgendaManager.createAppointmentForSlot(${h})" style="height:100%; color:#64748b; font-size:0.8rem; display:flex; align-items:center; cursor:pointer; opacity:0.3;">
                    <i class="bi bi-plus-lg"></i> Disponible
                </div>`;
            }

            return `
            <div style="display:grid; grid-template-columns: 60px 1fr; gap:10px; border-bottom:1px solid rgba(255,255,255,0.05); min-height:60px;">
                <div style="text-align:right; padding-top:10px; color:var(--text-muted); font-size:0.9rem;">${timeLabel}</div>
                <div style="padding:5px;">${content}</div>
            </div>`;
        }).join('');

        return `<div style="background:rgba(0,0,0,0.2); border-radius:12px; padding:10px;">${slots}</div>`;
    },

    shiftDate(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
        this.render();
    },

    createAppointmentForSlot(hour) {
        const query = prompt("Buscar Paciente (Nombre o Cédula):");
        if (!query) return;

        const results = getSearchResults(query);
        if (results.length === 0) {
            if(confirm("Paciente no encontrado. ¿Crear cita provisional?")) {
                this.saveAppointment(hour, "Provisional: " + query, "guest", "Consulta General");
            }
        } else {
            const p = results[0].patient;
            const name = `${p.primer_nombre} ${p.primer_apellido}`;
            const motive = prompt("Motivo de consulta:", "Control");
            this.saveAppointment(hour, name, p.documento_numero, motive);
        }
    },

    saveAppointment(hour, name, id, motive) {
        const key = `CIMA_APT_${this.currentDate.toISOString().split('T')[0]}_${hour}`;
        const data = { patientName: name, patientId: id, motive: motive };
        localStorage.setItem(key, JSON.stringify(data));
        this.render();
        flash("Cita agendada");
    },

    createAppointment() {
        const h = prompt("Hora (formato 24h, ej: 9, 14):");
        if(h) this.createAppointmentForSlot(parseInt(h));
    },

    openPatientFromAgenda(docId) {
        // Cambiar a modo consulta y cargar paciente
        window.changeMode('CONSULTATION');
        
        // Simular búsqueda y carga
        const db = JSON.parse(localStorage.getItem('CIMA_DB_ORL_V2') || '{}');
        const record = db[docId];
        
        if (record) {
            loadHistoryRecord(record);
        } else {
            // Si es un "guest" o provisional
            if(confirm("Este es un paciente provisional o no registrado. ¿Crear ficha nueva?")) {
                // Reset y dejar listo para llenar
                import('engine').then(module => module.resetStory());
            }
        }
    }
};

window.AgendaManager = AgendaManager;
