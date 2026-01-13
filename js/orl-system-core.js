// ARCHIVO: js/orl-system-core.js
// Contiene las funciones principales del sistema que interactúan con la barra de herramientas

// =========== VARIABLES GLOBALES ===========
let currentPatientData = null;
let currentConsultData = null;
let consultComponent = null;

// =========== FUNCIONES UTILITARIAS ===========
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function flash(msg, isError = false) {
  const e = $("#err");
  e.textContent = msg;
  e.className = isError ? 'error' : '';
  e.style.display = 'block';
  setTimeout(() => e.style.display = 'none', 3000);
}

function showErr(msg) { 
  flash(msg, true); 
  console.error(msg); 
}

function validatePatientId(id) {
  return /^[A-Za-z]+-\d+$/.test(id);
}

// =========== ALMACENAMIENTO LOCAL ===========
const LOCAL_STORAGE_KEY = 'CIMA_PACIENTES';

function saveToLocal() {
  if (!currentPatientData || !currentPatientData.patient_id) {
    showErr('Complete ID del paciente antes de guardar');
    return false;
  }
  
  try {
    let pacientes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
    pacientes[currentPatientData.patient_id] = {
      patient: currentPatientData,
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

function searchPatientsLocal(field, value) {
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

function loadPatientById(id) {
  try {
    const pacientes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
    const data = pacientes[id];
    
    if (!data) {
      showErr('Paciente no encontrado');
      return;
    }
    
    currentPatientData = data.patient;
    currentConsultData = data.consultData;
    
    updatePatientForm(data.patient);
    
    // Disparar evento para que React cargue los datos
    window.dispatchEvent(new CustomEvent('loadConsultData', { detail: data.consultData }));
    
    flash('Historia cargada: ' + data.patient.full_name);
    return true;
  } catch (err) {
    showErr('Error cargando: ' + err.message);
    return false;
  }
}

function updatePatientForm(patientData) {
  $("#patient_id").value = patientData.patient_id || '';
  $("#full_name").value = patientData.full_name || '';
  $("#birthdate").value = patientData.birthdate || '';
  $("#sex").value = patientData.sex || '';
  $("#ocupacion").value = patientData.ocupacion || '';
  $("#has_seguro").checked = patientData.has_seguro || false;
  $("#seguro_company").value = patientData.seguro_company || '';
  $("#seguro_box").classList.toggle('hidden', !patientData.has_seguro);
  $("#email").value = patientData.email || '';
  $("#phone").value = patientData.phone || '';
  
  $("#patientForm").classList.remove('hidden');
}

// =========== GESTIÓN DE EVENTOS DE LA BARRA ===========
function setupToolbarEvents() {
  // Botón: Nueva historia clínica
  $("#btnNew").addEventListener('click', () => {
    if (!confirm('¿Crear nueva historia médica? Se perderán los datos no guardados.')) return;
    
    currentPatientData = null;
    currentConsultData = null;
    
    $("#patientForm").classList.remove('hidden');
    $("#patient_id").value = '';
    $("#full_name").value = '';
    $("#birthdate").value = '';
    $("#sex").value = '';
    $("#ocupacion").value = '';
    $("#has_seguro").checked = false;
    $("#seguro_company").value = '';
    $("#seguro_box").classList.add('hidden');
    $("#email").value = '';
    $("#phone").value = '';
    
    window.dispatchEvent(new CustomEvent('resetConsult'));
    
    flash('Nueva historia médica iniciada');
  });
  
  // Botón: Agregar Consulta
  $("#btnAddConsulta").addEventListener('click', () => {
    const pid = $("#patient_id").value.trim();
    const name = $("#full_name").value.trim();
    
    if (!pid || !name) {
      showErr('Complete al menos ID y nombre del paciente');
      return;
    }
    
    if (!validatePatientId(pid)) {
      showErr('ID debe tener formato: Letra(s)-Número (ej: V-12345)');
      return;
    }
    
    // Actualizar datos del paciente
    currentPatientData = {
      patient_id: pid,
      full_name: name,
      birthdate: $("#birthdate").value,
      sex: $("#sex").value,
      ocupacion: $("#ocupacion").value,
      has_seguro: $("#has_seguro").checked,
      seguro_company: $("#seguro_company").value,
      email: $("#email").value,
      phone: $("#phone").value
    };
    
    // Disparar evento para agregar consulta en React
    window.dispatchEvent(new CustomEvent('addConsulta', { 
      detail: { patientId: pid, patientName: name } 
    }));
  });
  
  // Botón: Eliminar Última Consulta
  $("#btnDeleteLast").addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('deleteLast'));
  });
  
  // Botón: Cerrar HC
  $("#btnClose").addEventListener('click', () => {
    const pid = $("#patient_id").value.trim();
    const name = $("#full_name").value.trim();
    
    if (pid || name) {
      if (!confirm('¿Guardar y cerrar historia?')) return;
      if (saveToLocal()) {
        $("#patientForm").classList.add('hidden');
        window.dispatchEvent(new CustomEvent('closeConsult'));
        flash('Historia cerrada y guardada');
      }
    } else {
      $("#patientForm").classList.add('hidden');
      window.dispatchEvent(new CustomEvent('closeConsult'));
      flash('Historia cerrada');
    }
  });
  
  // Botón: Abrir HC (búsqueda)
  $("#btnOpen").addEventListener('click', () => {
    openSearchModal();
  });
}

function openSearchModal() {
  const modal = $('#searchModal');
  modal.classList.add('active');
  $('#searchValue').value = '';
  $('#searchResults').classList.add('hidden');
  $('#searchType').value = 'patient_id';
  $('#searchValue').focus();
  
  // Configurar eventos del modal
  $('#btnCancelSearch').addEventListener('click', closeSearchModal);
  $('#btnDoSearch').addEventListener('click', performSearch);
  
  function closeSearchModal() {
    modal.classList.remove('active');
  }
  
  function performSearch() {
    const field = $('#searchType').value;
    const value = $('#searchValue').value.trim();
    if (!value) {
      showErr('Ingrese un valor para buscar');
      return;
    }
    const patients = searchPatientsLocal(field, value);
    displaySearchResults(patients);
  }
  
  function displaySearchResults(patients) {
    const resultsList = $('#searchResultsList');
    const resultsContainer = $('#searchResults');
    
    if (patients.length === 0) {
      resultsList.innerHTML = '<div style="color: #999; padding: 20px; text-align: center;">No se encontraron resultados</div>';
      resultsContainer.classList.remove('hidden');
      return;
    }
    
    resultsList.innerHTML = patients.map(p => `
      <div class="card" style="margin: 10px 0; cursor: pointer; border: 2px solid #ddd; transition: all 0.2s;"
           onclick="loadPatientById('${p.id}')"
           onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateY(-2px)'"
           onmouseout="this.style.borderColor='#ddd'; this.style.transform='translateY(0)'">
        <div style="font-weight: 700; color: var(--primary);">${p.full_name || 'Sin nombre'}</div>
        <div style="font-size: 13px; color: #666; margin-top: 5px;">
          <div><strong>ID:</strong> ${p.id || 'N/A'}</div>
          <div><strong>Tel:</strong> ${p.phone || 'N/A'}</div>
          <div><strong>Última actualización:</strong> ${p.lastUpdated ? new Date(p.lastUpdated).toLocaleDateString() : 'N/A'}</div>
        </div>
      </div>
    `).join('');
    
    resultsContainer.classList.remove('hidden');
  }
}

// =========== INICIALIZACIÓN ===========
function initializeORLSystem() {
  setupToolbarEvents();
  
  // Configurar checkbox de seguro
  $("#has_seguro").addEventListener('change', (e) => {
    $("#seguro_box").classList.toggle('hidden', !e.target.checked);
  });
  
  // Mostrar formulario de paciente
  $("#patientForm").classList.remove('hidden');
  
  flash('✅ Sistema CIMA listo - Almacenamiento local activo');
}

// Exponer funciones globales necesarias
window.$ = $;
window.$$ = $$;
window.validatePatientId = validatePatientId;
window.saveToLocal = saveToLocal;
window.searchPatientsLocal = searchPatientsLocal;
window.loadPatientById = loadPatientById;
window.initializeORLSystem = initializeORLSystem;

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', initializeORLSystem);
