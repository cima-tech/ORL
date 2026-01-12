/* modules/calendar.js - Sistema de agenda médica */

export default class CalendarSystem {
    static STORAGE_KEY = 'CIMA_AGENDA_V1';
    
    static init(container) {
        this.container = container;
        this.render();
        this.loadEvents();
    }
    
    static render() {
        this.container.innerHTML = `
            <div class="calendar-header">
                <button id="prevWeek"><i class="fas fa-chevron-left"></i></button>
                <h3 id="currentWeek">Cargando...</h3>
                <button id="nextWeek"><i class="fas fa-chevron-right"></i></button>
                <select id="viewMode" class="model-select" style="margin-left: auto;">
                    <option value="day">Vista Diaria</option>
                    <option value="week" selected>Vista Semanal</option>
                    <option value="month">Vista Mensual</option>
                </select>
            </div>
            <div id="calendarView" class="calendar-view"></div>
        `;
        
        this.setupListeners();
        this.updateView();
    }
    
    static setupListeners() {
        document.getElementById('prevWeek').onclick = () => this.navigate(-1);
        document.getElementById('nextWeek').onclick = () => this.navigate(1);
        document.getElementById('viewMode').onchange = () => this.updateView();
    }
    
    static navigate(direction) {
        const mode = document.getElementById('viewMode').value;
        const today = new Date();
        
        if (mode === 'day') {
            today.setDate(today.getDate() + direction);
        } else if (mode === 'week') {
            today.setDate(today.getDate() + (direction * 7));
        } else if (mode === 'month') {
            today.setMonth(today.getMonth() + direction);
        }
        
        this.updateView(today);
    }
    
    static updateView(date = new Date()) {
        const mode = document.getElementById('viewMode').value;
        let viewHTML = '';
        
        if (mode === 'day') {
            viewHTML = this.renderDayView(date);
            document.getElementById('currentWeek').textContent = 
                date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } else if (mode === 'week') {
            viewHTML = this.renderWeekView(date);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            document.getElementById('currentWeek').textContent = 
                `Semana ${this.getWeekNumber(date)} - ${weekStart.toLocaleDateString()} al ${weekEnd.toLocaleDateString()}`;
        } else if (mode === 'month') {
            viewHTML = this.renderMonthView(date);
            document.getElementById('currentWeek').textContent = 
                date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        }
        
        document.getElementById('calendarView').innerHTML = viewHTML;
        this.renderEvents();
    }
    
    static renderDayView(date) {
        const hours = Array.from({length: 12}, (_, i) => i + 8); // 8 AM a 7 PM
        
        return `
            <div class="day-view">
                <div class="time-column">
                    ${hours.map(hour => `
                        <div class="time-slot">${hour}:00</div>
                        <div class="time-slot">${hour}:30</div>
                    `).join('')}
                </div>
                <div class="events-column">
                    ${hours.map(hour => `
                        <div class="hour-slot" data-hour="${hour}"></div>
                        <div class="halfhour-slot"></div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    static renderWeekView(date) {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const today = new Date();
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        
        const hours = Array.from({length: 12}, (_, i) => i + 8);
        
        return `
            <div class="week-view">
                <div class="days-header">
                    ${days.map((day, idx) => {
                        const dayDate = new Date(weekStart);
                        dayDate.setDate(weekStart.getDate() + idx);
                        const isToday = dayDate.toDateString() === today.toDateString();
                        return `
                            <div class="day-header ${isToday ? 'today' : ''}">
                                <div>${day}</div>
                                <div class="day-number">${dayDate.getDate()}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="week-grid">
                    <div class="time-column">
                        ${hours.map(hour => `<div class="time-label">${hour}:00</div>`).join('')}
                    </div>
                    ${days.map((_, dayIdx) => `
                        <div class="day-column" data-day="${dayIdx}">
                            ${hours.map(hour => `
                                <div class="hour-cell" data-hour="${hour}" data-day="${dayIdx}"></div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    static renderMonthView(date) {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        let calendar = '<div class="month-view"><div class="month-days-header">';
        
        // Encabezados de días
        days.forEach(day => {
            calendar += `<div class="month-day-header">${day}</div>`;
        });
        
        calendar += '</div><div class="month-days-grid">';
        
        // Días vacíos al inicio
        for (let i = 0; i < startingDay; i++) {
            calendar += '<div class="month-day empty"></div>';
        }
        
        // Días del mes
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
            const isToday = currentDate.toDateString() === today.toDateString();
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            
            calendar += `
                <div class="month-day ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}" 
                     data-date="${currentDate.toISOString().split('T')[0]}">
                    <div class="day-number">${day}</div>
                    <div class="day-events"></div>
                </div>
            `;
        }
        
        calendar += '</div></div>';
        return calendar;
    }
    
    static getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    static loadEvents() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        this.events = stored ? JSON.parse(stored) : [];
    }
    
    static saveEvents() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
    }
    
    static renderEvents() {
        // Limpiar eventos previos
        document.querySelectorAll('.event').forEach(el => el.remove());
        
        this.events.forEach(event => {
            this.renderEvent(event);
        });
    }
    
    static renderEvent(event) {
        const eventDate = new Date(event.date);
        const viewMode = document.getElementById('viewMode').value;
        
        if (viewMode === 'day') {
            // Renderizar en vista diaria
            const dayEvents = document.querySelector('.events-column');
            if (dayEvents) {
                const eventEl = document.createElement('div');
                eventEl.className = 'event';
                eventEl.innerHTML = `
                    <div class="event-title">${event.title}</div>
                    <div class="event-time">${event.startTime}</div>
                `;
                eventEl.style.top = `${this.timeToPosition(event.startTime)}px`;
                eventEl.style.height = `${this.durationToHeight(event.duration)}px`;
                eventEl.onclick = () => this.openEvent(event);
                dayEvents.appendChild(eventEl);
            }
        } else if (viewMode === 'week') {
            // Renderizar en vista semanal
            const dayIdx = eventDate.getDay();
            const hourCell = document.querySelector(`.hour-cell[data-hour="${event.startTime.split(':')[0]}"][data-day="${dayIdx}"]`);
            if (hourCell) {
                const eventEl = document.createElement('div');
                eventEl.className = 'event';
                eventEl.innerHTML = `
                    <div class="event-title">${event.title}</div>
                    <div class="event-time">${event.startTime}</div>
                `;
                eventEl.onclick = () => this.openEvent(event);
                hourCell.appendChild(eventEl);
            }
        } else if (viewMode === 'month') {
            // Renderizar en vista mensual
            const dateStr = eventDate.toISOString().split('T')[0];
            const dayCell = document.querySelector(`.month-day[data-date="${dateStr}"] .day-events`);
            if (dayCell) {
                const eventEl = document.createElement('div');
                eventEl.className = 'event-small';
                eventEl.innerHTML = `${event.startTime} - ${event.title}`;
                eventEl.onclick = () => this.openEvent(event);
                dayCell.appendChild(eventEl);
            }
        }
    }
    
    static timeToPosition(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return ((hours - 8) * 60 + minutes) * 0.8; // Factor de escala
    }
    
    static durationToHeight(duration) {
        return duration * 0.8; // 1 hora = 48px
    }
    
    static addEvent(event) {
        this.events.push(event);
        this.saveEvents();
        this.renderEvents();
    }
    
    static openEvent(event) {
        if (event.patientId) {
            // Abrir paciente asociado
            window.app.showPatientView(event.patientId);
        }
    }
    
    static scheduleAppointment(patientId, date, time, duration = 60) {
        const patient = window.StorageService.getPatient(patientId);
        if (!patient) return;
        
        const event = {
            id: 'apt_' + Date.now(),
            patientId,
            title: `Consulta: ${patient.nombres.primer_nombre} ${patient.nombres.primer_apellido}`,
            date: date.toISOString().split('T')[0],
            startTime: time,
            duration,
            notes: '',
            status: 'scheduled'
        };
        
        this.addEvent(event);
        return event;
    }
}

// Exportar para uso global
window.CalendarSystem = CalendarSystem;
