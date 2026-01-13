// ARCHIVO: js/orl-system-core.js
// Contiene las funciones principales del sistema que interactúan con la barra de herramientas

// =========== VARIABLES GLOBALES DEL SISTEMA ===========
let currentPatientData = null;
let currentConsultData = null;

// =========== FUNCIONES UTILITARIAS ===========
export const $ = s => document.querySelector(s);
export const $$ = s => Array.from(document.querySelectorAll(s));

export function flash(msg, isError = false) {
    const e = $("#err");
    e.textContent = msg;
    e.className = isError ? 'error' : '';
    e.style.display = 'block';
    setTimeout(() => e.style.display = 'none', 3000);
}

export function showErr(msg) { 
    flash(msg, true); 
    console.error(msg); 
}

// =========== ALMACENAMIENTO LOCAL ===========
const LOCAL_STORAGE_KEY = 'CIMA_PACIENTES';

export function saveToLocal() {
    // Guardar datos actuales en localStorage
    if (!currentPatientData || !currentPatientData.patient_id) {
        showErr('Complete ID del paciente antes de guardar');
        return false;
    }
    
    try {
        let pacientes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
        pacientes[currentPatientData.patient_id] = {
            ...currentPatientData,
            consultData: currentConsultData,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pacientes));
        flash('Historia guardada localmente');
        return true;
    } catch (err) {
        showErr('Error guardando: ' + err.message);
        return false;
    }
}

export function searchPatientsLocal(field, value) {
    try {
        const pacientes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
        const results = [];
        
        for (const [id, data] of Object.entries(pacientes)) {
            const patient = data.patient;
            if (patient[field] && patient[field].toLowerCase().includes(value.toLowerCase())) {
                results.push({
                    id: id,
                    ...patient,
                    lastUpdated: data.lastUpdated
                });
            }
        }
        
        return results;
    } catch (err) {
        showErr('Error en búsqueda: ' + err.message);
        return [];
    }
}

export function loadPatientById(id) {
    try {
        const pacientes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
        const data = pacientes[id];
        
        if (!data) {
            showErr('Paciente no encontrado');
            return;
        }
        
        // Cargar datos del paciente
        currentPatientData = data.patient;
        currentConsultData = data.consultData;
        
        // Actualizar formulario de paciente
        updatePatientForm(data.patient);
        
        // Notificar al componente React para cargar los datos de consulta
        window.dispatchEvent(new CustomEvent('loadConsultData', { detail: data.consultData }));
        
        flash('Historia cargada: ' + data.patient.full_name);
        return true;
    } catch (err) {
        showErr('Error cargando: ' + err.message);
        return false;
    }
}

// =========== INICIALIZACIÓN DEL SISTEMA ===========
export function initializeORLSystem() {
    // Configurar event listeners de la barra de herramientas
    setupToolbarEvents();
    
    // Configurar formulario de paciente
    setupPatientForm();
    
    // Mostrar formulario de paciente
    $("#patientForm")?.classList.remove('hidden');
    
    flash('✅ Sistema CIMA listo - Almacenamiento local activo');
}

function setupToolbarEvents() {
    // Botón: Nueva historia clínica
    $("#btnNew")?.addEventListener('click', () => {
        if (!confirm('¿Crear nueva historia médica? Se perderán los datos no guardados.')) return;
        
        // Resetear datos
        currentPatientData = null;
        currentConsultData = null;
        
        // Limpiar formulario
        $("#patientForm")?.classList.remove('hidden');
        $("#patient_id").value = '';
        $("#full_name").value = '';
        $("#birthdate").value = '';
        $("#sex").value = '';
        $("#ocupacion").value = '';
        $("#has_seguro").checked = false;
        $("#seguro_company").value = '';
        $("#seguro_box")?.classList.add('hidden');
        $("#email").value = '';
        $("#phone").value = '';
        
        // Notificar a React para resetear consulta
        window.dispatchEvent(new CustomEvent('resetConsult'));
        
        flash('Nueva historia médica iniciada');
    });
    
    // Botón: Agregar Consulta (dispara evento para React)
    $("#btnAddConsulta")?.addEventListener('click', () => {
        // Validar datos del paciente primero
        const pid = $("#patient_id")?.value.trim();
        const name = $("#full_name")?.value.trim();
        
        if (!pid || !name) {
            showErr('Complete al menos ID y nombre del paciente');
            return;
        }
        
        // Disparar evento para que React agregue consulta
        window.dispatchEvent(new CustomEvent('addConsulta', { 
            detail: { patientId: pid, patientName: name } 
        }));
    });
    
    // Botón: Eliminar Última Consulta (dispara evento para React)
    $("#btnDeleteLast")?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('deleteLast'));
    });
    
    // Botón: Cerrar HC
    $("#btnClose")?.addEventListener('click', () => {
        const pid = $("#patient_id")?.value.trim();
        const name = $("#full_name")?.value.trim();
        
        if (pid || name) {
            if (!confirm('¿Guardar y cerrar historia?')) return;
            if (saveToLocal()) {
                $("#patientForm")?.classList.add('hidden');
                // Notificar a React para limpiar consultas
                window.dispatchEvent(new CustomEvent('closeConsult'));
                flash('Historia cerrada y guardada');
            }
        } else {
            $("#patientForm")?.classList.add('hidden');
            window.dispatchEvent(new CustomEvent('closeConsult'));
            flash('Historia cerrada');
        }
    });
    
    // Botón: Abrir HC (búsqueda)
    $("#btnOpen")?.addEventListener('click', () => {
        // Implementar modal de búsqueda
        openSearchModal();
    });
}

function setupPatientForm() {
    // Configurar checkbox de seguro
    $("#has_seguro")?.addEventListener('change', (e) => {
        $("#seguro_box")?.classList.toggle('hidden', !e.target.checked);
    });
}

function updatePatientForm(patientData) {
    // Llenar formulario con datos del paciente
    $("#patient_id").value = patientData.patient_id || '';
    $("#full_name").value = patientData.full_name || '';
    $("#birthdate").value = patientData.birthdate || '';
    $("#sex").value = patientData.sex || '';
    $("#ocupacion").value = patientData.ocupacion || '';
    $("#has_seguro").checked = patientData.has_seguro || false;
    $("#seguro_company").value = patientData.seguro_company || '';
    $("#seguro_box")?.classList.toggle('hidden', !patientData.has_seguro);
    $("#email").value = patientData.email || '';
    $("#phone").value = patientData.phone || '';
    
    // Mostrar formulario
    $("#patientForm")?.classList.remove('hidden');
}

function openSearchModal() {
    // Implementar lógica del modal de búsqueda
    console.log('Abrir modal de búsqueda');
    // (Código del modal de búsqueda aquí)
}