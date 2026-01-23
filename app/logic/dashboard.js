import { $, STATE, fmtDate } from 'brain';

export const DashboardManager = {
    init() {
        this.render();
    },

    render() {
        const container = document.getElementById('view-dashboard');
        if (!container) return;

        // Cálculos simples (Mockup por ahora, luego vendrán de DB)
        const totalPatients = this.countPatients();
        const pendingInbox = 3; // Simulado

        const cardStyle = `background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; display:flex; flex-direction:column; justify-content:center;`;

        container.innerHTML = `
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-bottom:30px;">
                <div style="${cardStyle}">
                    <div style="font-size:0.9rem; color:var(--text-muted);">Pacientes Totales</div>
                    <div style="font-size:2.5rem; font-weight:bold; color:var(--primary);">${totalPatients}</div>
                </div>
                <div style="${cardStyle}">
                    <div style="font-size:0.9rem; color:var(--text-muted);">Citas Hoy</div>
                    <div style="font-size:2.5rem; font-weight:bold; color:#f59e0b;">${this.countAppointmentsToday()}</div>
                </div>
                <div style="${cardStyle}">
                    <div style="font-size:0.9rem; color:var(--text-muted);">Ingresos Mes</div>
                    <div style="font-size:2.5rem; font-weight:bold; color:#10b981;">$ 0.00</div>
                </div>
                <div style="${cardStyle}">
                    <div style="font-size:0.9rem; color:var(--text-muted);">Inbox (Pendientes)</div>
                    <div style="font-size:2.5rem; font-weight:bold; color:#ef4444;">${pendingInbox}</div>
                </div>
            </div>

            <div class="card">
                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <h3><i class="bi bi-inbox"></i> Solicitudes Pendientes (Inbox)</h3>
                    <button class="btn btn-ghost btn-small"><i class="bi bi-arrow-clockwise"></i> Actualizar</button>
                </div>
                
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left; color:var(--text-muted);">
                            <th style="padding:10px;">Fecha</th>
                            <th style="padding:10px;">Paciente</th>
                            <th style="padding:10px;">Tipo</th>
                            <th style="padding:10px;">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderInboxRow('2026-01-22', 'Maria Perez', 'Pre-Registro Web')}
                        ${this.renderInboxRow('2026-01-22', 'Juan Rodriguez', 'Solicitud Cita')}
                        ${this.renderInboxRow('2026-01-21', 'Laboratorio Clínico', 'Resultados PDF')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderInboxRow(date, name, type) {
        return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:15px 10px;">${fmtDate(date)}</td>
            <td style="padding:15px 10px; font-weight:600;">${name}</td>
            <td style="padding:15px 10px;"><span class="badge" style="background:rgba(255,255,255,0.1); color:var(--text-main); font-weight:400;">${type}</span></td>
            <td style="padding:15px 10px;">
                <button class="btn btn-primary btn-small" onclick="alert('Función de Importar Datos (Pendiente Backend)')">Revisar</button>
            </td>
        </tr>`;
    },

    countPatients() {
        const db = JSON.parse(localStorage.getItem('CIMA_DB_ORL_V2') || '{}');
        return Object.keys(db).length;
    },

    countAppointmentsToday() {
        // Simple count logic mock
        return 0;
    }
};

window.DashboardManager = DashboardManager;
