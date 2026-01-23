import { $, $$, STATE, flash, showErr, fmtDate } from 'brain';
import { loadHistoryRecord, getSearchResults } from 'engine';

export const AgendaManager = {
    currentDate: new Date(),
    view: 'day', // 'day', 'month'

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
        
        let header = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <div style="color:var(--accent); font-size:1.2rem; text-transform:capitalize; display:flex; align-items:center; gap:15px;">
                    <button class="icon-btn" onclick="window.AgendaManager.shift(-1)"><i class="bi bi-chevron-left"></i></button>
                    <span style="min-width:200px; text-align:center;">${this.view === 'day' ? dateStr : this.currentDate.toLocaleDateString('es-VE', {month:'long', year:'numeric'})}</span>
                    <button class="icon-btn" onclick="window.AgendaManager.shift(1)"><i class="bi bi-chevron-right"></i></button>
                </div>
                <div>
                    <button class="btn btn-${this.view==='day'?'primary':'ghost'}" onclick="window.AgendaManager.changeView('day')">Día</button>
                    <button class="btn btn-${this.view==='month'?'primary':'ghost'}" onclick="window.AgendaManager.changeView('month')">Mes</button>
                </div>
            </div>
        `;

        let content = '';
        if (this.view === 'day') {
            content = this.renderDayView();
        } else {
            content = this.renderMonthView();
        }

        container.innerHTML = header + content;
    },

    // VISTA DIARIA CON HORARIO DE ATENCIÓN
    renderDayView() {
        const dayNameMap = { 0:'sunday', 1:'monday', 2:'tuesday', 3:'wednesday', 4:'thursday', 5:'friday', 6:'saturday' };
        const dayKey = dayNameMap[this.currentDate.getDay()];
        const schedule = STATE.currentUser.commercial?.schedule?.[dayKey] || { active: false };

        if (!schedule.active) {
            return `<div style="padding:50px; text-align:center; color:var(--text-muted); font-size:1.2rem;">
                <i class="bi bi-shop-window" style="font-size:3rem; display:block; margin-bottom:10px;"></i>
                No hay atención configurada para este día (${dayKey}).
            </div>`;
        }

        const startH = parseInt(schedule.start.split(':')[0]) || 8;
        const endH = parseInt(schedule.end.split(':')[0]) || 17;
        const slotsHTML = [];

        for (let h = startH; h < endH; h++) {
            const timeLabel = `${h}:00`.padStart(5, '0');
            const key = `CIMA_APT_${this.currentDate.toISOString().split('T')[0]}_${h}`;
            const apt = JSON.parse(localStorage.getItem(key));

            let slotContent = '';
            if (apt) {
                slotContent = `
                <div class="apt-card" onclick="window.AgendaManager.openPatientFromAgenda('${apt.patientId}')" style="background:var(--primary); padding:10px; border-radius:8px; cursor:pointer; color:white; height:100%; display:flex; flex-direction:column; justify-content:center; box-shadow:0 2px 10px rgba(0,0,0,0.2);">
                    <div style="font-weight:bold; display:flex; justify-content:space-between;">
                        ${apt.patientName} 
                        <span style="font-weight:normal; font-size:0.8em; opacity:0.8;">${apt.isProvisional ? '(Prov)' : ''}</span>
                    </div>
                    <div style="font-size:0.85rem;">${apt.motive}</div>
                </div>`;
            } else {
                slotContent = `<div class="apt-empty" onclick="window.AgendaManager.createAppointmentForSlot(${h})" style="height:100%; border:1px dashed var(--glass-border); border-radius:8px; display:flex; align-items:center; padding-left:15px; cursor:pointer; opacity:0.5; color:var(--text-muted); transition:all 0.2s;">
                    <i class="bi bi-plus-lg" style="margin-right:10px;"></i> Disponible
                </div>`;
            }

            slotsHTML.push(`
            <div style="display:grid; grid-template-columns: 60px 1fr; gap:15px; margin-bottom:10px; height:70px;">
                <div style="text-align:right; padding-top:20px; color:var(--text-muted); font-family:monospace; font-size:1rem;">${timeLabel}</div>
                <div>${slotContent}</div>
            </div>`);
        }

        return `<div style="background:rgba(255,255,255,0.02); border-radius:12px; padding:20px;">${slotsHTML.join('')}</div>`;
    },

    // VISTA MENSUAL SIMPLE
    renderMonthView() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Lunes=0

        let daysHTML = '';
        // Espacios vacíos
        for (let i = 0; i < startingDay; i++) {
            daysHTML += `<div></div>`;
        }
        
        // Días
        for (let d = 1; d <= daysInMonth; d++) {
            const dateISO = new Date(year, month, d).toISOString().split('T')[0];
            // Buscar citas en este día (scan simple de keys)
            // Nota: En producción esto sería una query al backend. Aquí es un scan costoso pero funcional para demo.
            let count = 0;
            for(let h=0; h<24; h++) {
                if(localStorage.getItem(`CIMA_APT_${dateISO}_${h}`)) count++;
            }

            const isToday = new Date().toISOString().split('T')[0] === dateISO;
            const style = isToday ? 'border-color:var(--accent); background:rgba(34, 211, 238, 0.1);' : 'border-color:rgba(255,255,255,0.1);';
            const dot = count > 0 ? `<div style="width:6px; height:6px; background:var(--primary); border-radius:50%; margin:0 auto;"></div>` : '';

            daysHTML += `
                <div onclick="window.AgendaManager.goToDate('${dateISO}')" style="aspect-ratio:1; border:1px solid; ${style} border-radius:8px; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px;">
                    <span style="font-size:1.1rem; font-weight:${isToday?'bold':'normal'}; color:${isToday?'var(--accent)':'inherit'}">${d}</span>
                    ${dot}
                    ${count > 0 ? `<span style="font-size:0.7rem; color:var(--text-muted);">${count} citas</span>` : ''}
                </div>
            `;
        }

        return `
            <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:10px; text-align:center;">
                <div style="font-weight:bold; color:var(--text-muted);">Lun</div>
                <div style="font-weight:bold; color:var(--text-muted);">Mar</div>
                <div style="font-weight:bold; color:var(--text-muted);">Mié</div>
                <div style="font-weight:bold; color:var(--text-muted);">Jue</div>
                <div style="font-weight:bold; color:var(--text-muted);">Vie</div>
                <div style="font-weight:bold; color:var(--text-muted);">Sáb</div>
                <div style="font-weight:bold; color:var(--text-muted);">Dom</div>
                ${daysHTML}
            </div>
        `;
    },

    shift(n) {
        if (this.view === 'day') {
            this.currentDate.setDate(this.currentDate.getDate() + n);
        } else {
            this.currentDate.setMonth(this.currentDate.getMonth() + n);
        }
        this.render();
    },

    goToDate(iso) {
        this.currentDate = new Date(iso + 'T12:00:00'); // Evitar problemas de timezone
        this.changeView('day');
    },

    createAppointmentForSlot(hour) {
        const query = prompt("Buscar Paciente (Nombre o Cédula):");
        if (!query) return;

        const results = getSearchResults(query);
        let name, id, isProv = false;

        if (results.length === 0) {
            if(confirm("Paciente no encontrado. ¿Crear cita provisional?")) {
                name = "Provisional: " + query;
                id = "guest_" + Date.now();
                isProv = true;
            } else return;
        } else {
            const p = results[0].patient;
            name = `${p.primer_nombre} ${p.primer_apellido}`;
            id = p.documento_numero;
        }

        const motive = prompt("Motivo de consulta:", "Control");
        this.saveAppointment(hour, name, id, motive, isProv);
    },

    saveAppointment(hour, name, id, motive, isProv) {
        const key = `CIMA_APT_${this.currentDate.toISOString().split('T')[0]}_${hour}`;
        const data = { patientName: name, patientId: id, motive: motive, isProvisional: isProv };
        localStorage.setItem(key, JSON.stringify(data));
        this.render();
        flash("Cita agendada");
    },

    openPatientFromAgenda(docId) {
        window.changeMode('CONSULTATION');
        
        // Si es guest provisional, solo abrimos ficha limpia
        if (docId.startsWith('guest_')) {
            import('engine').then(module => {
                module.resetStory();
                flash("Abriendo ficha para paciente nuevo...");
            });
            return;
        }

        const db = JSON.parse(localStorage.getItem('CIMA_DB_ORL_V2') || '{}');
        const record = db[docId];
        
        if (record) {
            loadHistoryRecord(record);
        } else {
            alert("Error: Ficha de paciente no encontrada en BD.");
        }
    }
};

window.AgendaManager = AgendaManager;
