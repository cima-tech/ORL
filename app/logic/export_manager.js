import { showErr, flash, fmtDate, STATE, $ } from 'brain';
import { ServiceLoader } from './service_loader.js';

export const ExportManager = {
    
    // Renderiza el contenido del Drawer de Exportación
    renderDrawer() {
        const container = document.getElementById('export-content');
        if (!container) return;

        const pName = $("#primer_nombre")?.value || "Paciente";
        const docName = STATE.currentPreviewDoc === 'INF' ? 'Informe Médico' : 'Récipe e Indicaciones';

        const html = `
            <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:3rem; color:#60a5fa;"><i class="bi bi-file-earmark-medical"></i></div>
                <h4 style="margin:10px 0; color:white;">${docName}</h4>
                <p style="color:#94a3b8; font-size:0.9rem;">Para: ${pName}</p>
            </div>

            <div class="form-section">
                <div class="form-section-title">Acciones de Descarga</div>
                <button class="btn btn-primary" onclick="ExportManager.downloadPNG()" style="width:100%; margin-bottom:10px; justify-content:center;">
                    <i class="bi bi-card-image"></i> Descargar como Imagen (PNG)
                </button>
                <button class="btn btn-ghost" disabled style="width:100%; justify-content:center; opacity:0.5;">
                    <i class="bi bi-file-pdf"></i> Descargar PDF (Próximamente)
                </button>
            </div>

            <div class="form-section" style="margin-top:20px;">
                <div class="form-section-title">Compartir</div>
                <button class="btn btn-success" onclick="ExportManager.shareWhatsApp()" style="width:100%; margin-bottom:10px; justify-content:center;">
                    <i class="bi bi-whatsapp"></i> Enviar por WhatsApp
                </button>
                <button class="btn btn-ghost" onclick="ExportManager.shareEmail()" style="width:100%; justify-content:center;">
                    <i class="bi bi-envelope"></i> Enviar por Email
                </button>
            </div>
        `;
        container.innerHTML = html;
    },

    async downloadPNG() {
        const element = document.querySelector('.doc-page');
        if (!element) return showErr("No hay documento visible");

        try {
            flash("Generando imagen...");
            
            // Clonar para renderizado limpio
            const clone = element.cloneNode(true);
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.appendChild(clone);
            document.body.appendChild(tempDiv);

            if (typeof html2canvas === 'undefined') throw new Error("Librería gráfica no cargada");

            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            document.body.removeChild(tempDiv);

            // Nombre archivo
            const id = $("#documento_numero")?.value || 'S/ID';
            const type = STATE.currentPreviewDoc === 'INF' ? 'INFORME' : 'RECIPE';
            const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
            const filename = `CIMA_${id}_${type}_${date}.png`;

            // Descargar
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                flash("Descarga iniciada");
            });

        } catch (e) {
            console.error(e);
            showErr("Error al exportar: " + e.message);
        }
    },

    shareWhatsApp() {
        const phone = $("#tel_principal")?.value || "";
        const cleanPhone = phone.replace(/\D/g, '');
        
        if (!cleanPhone) return showErr("El paciente no tiene teléfono registrado");

        const pName = $("#primer_nombre")?.value;
        const type = STATE.currentPreviewDoc === 'INF' ? 'su Informe Médico' : 'su Récipe e Indicaciones';
        const dr = STATE.currentUser?.profile?.name || "su Doctor";

        const text = `Hola ${pName}, le envío ${type} de la consulta de hoy.\n\nAtte. ${dr}`;
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
        
        window.open(url, '_blank');
    },

    shareEmail() {
        const email = $("#email_principal")?.value;
        if (!email) return showErr("El paciente no tiene email registrado");

        const subject = "Documentos Médicos - Consulta ORL";
        const body = "Adjunto encontrará los documentos de su consulta médica.";
        
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
};

// Exponer globalmente para los onclick del HTML
window.ExportManager = ExportManager;
