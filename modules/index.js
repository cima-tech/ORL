import PatientProfile from './patient-profile.js';

// Asumimos que ORL-001.js expone 'window.ORL_MODULE' (según tu código anterior)

const CIMA_App = {
    state: {
        profile: null,
        visits: [],
        currentVisitId: null,
        theme: 'light',
        useSignature: true
    },

    init() {
        this.state.profile = new PatientProfile();
        this.bindEvents();
        this.loadTheme();
        this.checkAutosave();
    },

    // --- MANEJO DE EVENTOS GLOBALES ---
    bindEvents() {
        // Botones de la barra superior
        document.getElementById('btn-new').onclick = () => location.reload();
        document.getElementById('btn-save').onclick = () => this.saveToLocal();
        document.getElementById('btn-load').onclick = () => document.getElementById('file-input').click();
        document.getElementById('btn-theme').onclick = () => this.toggleTheme();
        
        // Input de carga
        document.getElementById('file-input').onchange = (e) => this.loadFromFile(e);
        
        // Botones de consulta
        document.getElementById('btn-add-visit').onclick = () => this.addVisit();
        document.getElementById('btn-del-visit').onclick = () => this.deleteLastVisit();

        // Preview
        document.getElementById('btn-export').onclick = () => this.exportToPNG();
        document.getElementById('doc-type').onchange = () => this.renderPreview();
        document.getElementById('btn-sig').onclick = () => {
            this.state.useSignature = !this.state.useSignature;
            this.renderPreview();
        };
    },

    // --- GESTIÓN DE TEMA ---
    toggleTheme() {
        const body = document.body;
        const current = body.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', next);
        this.state.theme = next;
        localStorage.setItem('cima_theme', next);
    },
    loadTheme() {
        const saved = localStorage.getItem('cima_theme') || 'light';
        document.body.setAttribute('data-theme', saved);
        this.state.theme = saved;
    },

    // --- SISTEMA DE TABS ---
    switchTab(tabId, btnElement) {
        // Ocultar todos
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        
        // Mostrar seleccionado
        document.getElementById(tabId).classList.remove('hidden');
        btnElement.classList.add('active');
    },

    // --- SINCRONIZACIÓN PERFIL PACIENTE ---
    syncProfileFromDOM() {
        const p = this.state.profile;
        const getVal = (id) => document.getElementById(id)?.value || "";
        const getCheck = (id) => document.getElementById(id)?.checked || false;

        // Mapeo manual de campos DOM a Objeto Profile
        p.identificacion.documento_tipo = "Cédula"; // Hardcoded para el demo
        p.identificacion.documento_numero = getVal('pp-id');
        p.identificacion.codigo_interno_cima = getVal('pp-code');
        
        p.nombres.primer_nombre = getVal('pp-name1');
        p.nombres.segundo_nombre = getVal('pp-name2');
        p.nombres.primer_apellido = getVal('pp-surname1');
        p.nombres.segundo_apellido = getVal('pp-surname2');

        p.demografia.fecha_nacimiento = getVal('pp-dob');
        p.demografia.genero = getVal('pp-gender');
        p.demografia.estado_civil = getVal('pp-civil');

        p.datos_biologicos.peso_kg = getVal('pp-weight');
        p.datos_biologicos.talla_cm = getVal('pp-height');
        p.datos_biologicos.grupo_sanguineo = getVal('pp-blood');
        p.datos_biologicos.factor_rh = getVal('pp-rh');
        p.datos_biologicos.lateralidad = getVal('pp-laterality');

        p.contacto.tel_principal = getVal('pp-phone');
        p.contacto.email_principal = getVal('pp-email');
        p.contacto.dir_calle_num = getVal('pp-address');
        p.contacto.dir_ciudad = getVal('pp-city');

        p.redes_sociales.instagram = getVal('pp-insta');
        p.redes_sociales.x_twitter = getVal('pp-twitter');

        p.contacto_emergencia.nombre = getVal('pp-emer-name');
        p.contacto_emergencia.telefono = getVal('pp-emer-phone');

        p.alertas_clinicas.alergias_check = getCheck('chk-alg');
        p.alertas_clinicas.alergias_detalle = getVal('pp-alg-desc');

        // Antecedentes Personales (Manual mapping para los chips del DOM)
        const apChips = document.querySelectorAll('#tab-antec .chip.on');
        // Reset
        ['hipertension','diabetes','asma','cardiopatias','epilepsia','tiroideos'].forEach(k => p.antecedentes_personales[k] = false);
        apChips.forEach(c => {
            const txt = c.textContent;
            if(txt === "Hipertensión") p.antecedentes_personales.hipertension = true;
            if(txt === "Diabetes") p.antecedentes_personales.diabetes = true;
            if(txt === "Asma") p.antecedentes_personales.asma = true;
            if(txt === "Cardiopatías") p.antecedentes_personales.cardiopatias = true;
            if(txt === "Epilepsia") p.antecedentes_personales.epilepsia = true;
            if(txt === "Tiroides") p.antecedentes_personales.tiroideos = true;
        });

        // Recalcular automáticos
        p._calcularCampos();
        this.updateReadOnlyFields();
    },

    updateReadOnlyFields() {
        document.getElementById('pp-age').value = this.state.profile.demografia.edad_auto + ' años';
        document.getElementById('pp-imc').value = this.state.profile.datos_biologicos.imc_auto;
    },

    // --- GESTIÓN DE VISITAS ---
    addVisit() {
        // Validar paciente
        this.syncProfileFromDOM();
        if(!this.state.profile.identificacion.documento_numero) {
            alert("Por favor ingrese el ID del paciente.");
            document.getElementById('pp-id').focus();
            return;
        }

        const vid = 'visit-' + Date.now();
        const type = this.state.visits.length === 0 ? 'Primera' : 'Sucesiva';
        
        this.state.visits.push({ id: vid, type: type });
        this.renderVisitCard(vid, type);
    },

    deleteLastVisit() {
        if(this.state.visits.length === 0) return;
        if(confirm("¿Eliminar última consulta?")) {
            this.state.visits.pop();
            document.getElementById('visits-container').lastElementChild.remove();
            document.getElementById('preview-container').style.display = 'none';
        }
    },

    renderVisitCard(vid, type) {
        const container = document.getElementById('visits-container');
        const card = document.createElement('div');
        card.className = 'glass visit-card';
        card.id = vid;

        // Estructura HTML limpia que coincidirá con los selectores de ORL-001.js
        card.innerHTML = `
            <div class="visit-header">
                <div style="font-weight:700; color:var(--accent-color)">${type}</div>
                <div class="flex-row">
                    <input type="datetime-local" value="${new Date().toISOString().slice(0,16)}" style="width:auto; height:32px;">
                    <button class="btn" style="padding:4px 12px; font-size:11px;" onclick="CIMA_App.openPreview('${vid}')">Generar Doc</button>
                </div>
            </div>
            <div class="visit-body">
                <!-- Columna Izquierda: Clínica -->
                <div class="flex-col" style="display:flex; flex-direction:column; gap:12px;">
                    <div>
                        <span class="label">Enfermedad Actual</span>
                        <textarea id="ea-${vid}" class="txt-ea" rows="3"></textarea>
                    </div>
                    <div>
                        <span class="label">Motivo</span>
                        <input type="text" id="motivo-${vid}" class="txt-motivo">
                        <div class="chips chips-motivo"></div>
                    </div>
                    <div>
                        <span class="label">Antecedentes P.</span>
                        <input type="text" id="ap-${vid}" class="txt-ap">
                        <div class="chips chips-ap"></div>
                    </div>
                    <div>
                        <span class="label">Diagnóstico</span>
                        <input type="text" id="dx-${vid}" class="txt-dx">
                        <div class="chips chips-dx"></div>
                    </div>
                </div>
                
                <!-- Columna Derecha: Exámenes y Rx -->
                <div class="flex-col" style="display:flex; flex-direction:column; gap:12px;">
                    <div>
                        <span class="label">Examen Físico</span>
                        <div id="pe-${vid}" class="pe-panels"></div>
                    </div>
                    <div>
                        <span class="label">Estudios</span>
                        <div class="chips" id="study-picker-${vid}"></div>
                        <div id="study-panels-${vid}" class="section-box"></div>
                    </div>
                    <div>
                        <span class="label">Plan de Tratamiento</span>
                        <div id="recipe-${vid}" class="recipe-chips-container"></div>
                        <div id="indicaciones-${vid}" class="indicaciones-dropdowns" style="margin-top:10px"></div>
                        <textarea id="plan-${vid}" class="txt-plan" rows="6" style="margin-top:10px"></textarea>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
        this.initVisitLogic(vid);
    },

    initVisitLogic(vid) {
        const scope = (sel) => `#${vid} ` + sel;

        // 1. Autollenado EA
        const ea = document.querySelector(scope('.txt-ea'));
        const age = this.state.profile.demografia.edad_auto;
        const sex = this.state.profile.demografia.genero;
        ea.value = `Paciente ${sex} de ${age} años quien acude a consulta por presentar...`;

        // 2. Inicializar Lógica ORL (ORL-001.js)
        // Nota: Pasamos selectores con scope para que solo afecten a esta tarjeta
        // Como ORL_UI usa querySelector, pasamos el contexto o modificamos la librería.
        // Para este ejemplo, asumimos que llamaremos a los helpers específicos pasando el contenedor.
        
        // --- CHIPS MOTIVOS ---
        window.ORL_MODULE.UI.renderChips(scope('.chips-motivo'), window.ORL_MODULE.DATA.MOTIVOS, scope('.txt-motivo'));
        
        // --- CHIPS AP ---
        window.ORL_MODULE.UI.renderChips(scope('.chips-ap'), window.ORL_MODULE.DATA.ANTECEDENTES, scope('.txt-ap'));

        // --- CHIPS DX ---
        window.ORL_MODULE.UI.renderChips(scope('.chips-dx'), window.ORL_MODULE.DATA.DX, scope('.txt-dx'));

        // --- EXAMEN FÍSICO ---
        // Hack: Temporalmente asignamos containerSelector al objeto UI
        const originalRenderPE = window.ORL_MODULE.UI.renderPhysicalExam;
        window.ORL_MODULE.UI.renderPhysicalExam = function() {
            const container = document.querySelector(this.containerSelector); 
            // (Copia lógica original de PE aquí adaptada al scope)
            // Para simplificar y no duplicar 100 lineas, usamos la original apuntando al container correcto
            // Nota: La función original usa '.pe-panels', necesitamos inyectar el selector
            // Solución rápida: usar la función global pero buscar dentro del card
             const peContainer = document.querySelector(scope('.pe-panels'));
             peContainer.innerHTML = ''; // Limpiar
             // Lógica simplificada de PE (en app real se inyectaría el módulo completo)
             peContainer.innerHTML = '<div style="padding:10px; color:#666">Lógica de PE cargada...</div>';
        };
        window.ORL_MODULE.UI.containerSelector = scope('.pe-panels');
        window.ORL_MODULE.UI.renderPhysicalExam();

        // --- ESTUDIOS (Picker) ---
        const studyPicker = document.querySelector(scope('#study-picker-'+vid));
        Object.keys(window.ORL_MODULE.DATA.STUDIES).forEach(studyName => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = studyName;
            chip.onclick = () => this.toggleStudyPanel(vid, studyName, chip);
            studyPicker.appendChild(chip);
        });

        // --- RECIPE ---
        // Necesitamos inyectar la lógica de recipe en el container
        const recipeContainer = document.querySelector(scope('.recipe-chips-container'));
        const indContainer = document.querySelector(scope('.indicaciones-dropdowns'));
        const planArea = document.querySelector(scope('.txt-plan'));

        // Render simple de meds (adaptado del modulo)
        for (const [group, meds] of Object.entries(window.ORL_MODULE.DATA.RECIPE_MEDS)) {
            const grpDiv = document.createElement('div');
            grpDiv.innerHTML = `<div style="font-size:10px; font-weight:700; margin-top:4px; color:var(--text-secondary)">${group}</div><div class="chips"></div>`;
            const chipBox = grpDiv.querySelector('.chips');
            
            meds.forEach(med => {
                const c = document.createElement('div');
                c.className = 'chip';
                c.textContent = med;
                c.onclick = () => {
                    c.classList.toggle('on');
                    this.handleMedSelect(c, med, group, recipeContainer, indContainer, planArea);
                };
                chipBox.appendChild(c);
            });
            recipeContainer.appendChild(grpDiv);
        }
    },

    handleMedSelect(chip, med, group, recCont, indCont, planArea) {
        // Lógica simplificada para el ejemplo (actualiza Recipe y Plan)
        const active = [...recCont.querySelectorAll('.chip.on')].map(c => c.textContent);
        // Aquí iría la lógica compleja de dropdowns de ORL-001
        planArea.value = `Medicamentos seleccionados:\n${active.join('\n')}`;
    },

    toggleStudyPanel(vid, name, btn) {
        const container = document.querySelector(`#study-panels-${vid}`);
        const existing = container.querySelector('.study-panel');
        
        if(existing) {
            existing.remove();
            btn.classList.remove('on');
            return;
        }

        btn.classList.add('on');
        const panel = document.createElement('div');
        panel.className = 'study-panel glass';
        panel.style.padding = '10px';
        panel.innerHTML = `<strong>${name}</strong><p style="font-size:12px; margin:5px 0">Contenido del estudio...</p>`;
        container.appendChild(panel);
    },

    // --- PREVIEW & EXPORT ---
    openPreview(vid) {
        this.state.currentVisitId = vid;
        document.getElementById('preview-container').style.display = 'flex';
        this.renderPreview();
    },

    renderPreview() {
        if(!this.state.currentVisitId) return;
        const type = document.getElementById('doc-type').value;
        const p = this.state.profile;
        const vid = this.state.currentVisitId;
        
        const docName = p.nombres.primer_nombre + " " + p.nombres.primer_apellido;
        const docID = p.identificacion.documento_numero;
        const docAge = p.demografia.edad_auto;

        // Recolección básica de datos (se debería usar ORL_DOCS si estuviera integrado al 100%)
        const eaVal = document.querySelector(`#${vid} .txt-ea`).value;
        const dxVal = document.querySelector(`#${vid} .txt-dx`).value;
        const planVal = document.querySelector(`#${vid} .txt-plan`).value;

        let html = "";
        
        if(type === 'INF') {
            html = `
                <div class="doc-page">
                    <div class="doc-header"><h3>INFORME MÉDICO</h3></div>
                    <div><b>Paciente:</b> ${docName} <b>ID:</b> ${docID} <b>Edad:</b> ${docAge}</div>
                    <br>
                    <div><b>Enfermedad Actual:</b><br>${eaVal}</div>
                    <br>
                    <div><b>Diagnóstico:</b> ${dxVal}</div>
                    <br>
                    <div><b>Plan:</b><br>${planVal}</div>
                    <br><br>
                    ${this.state.useSignature ? '<div style="font-family:cursive">Dra. Valentina González Yanez</div>' : ''}
                </div>`;
        } else {
            html = `<div class="doc-page"><center>Contenido para ${type}</center></div>`;
        }

        document.getElementById('doc-preview').innerHTML = html;
    },

    exportToPNG() {
        const element = document.querySelector('#doc-preview .doc-page');
        if(!element) return;
        
        html2canvas(element, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = `CIMA_${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    },

    // --- PERSISTENCIA ---
    saveToLocal() {
        this.syncProfileFromDOM();
        // Aquí deberíamos serializar visits también
        const data = {
            profile: this.state.profile,
            timestamp: new Date()
        };
        localStorage.setItem('cima_data', JSON.stringify(data));
        alert("Guardado en LocalStorage");
    },

    loadFromFile(e) {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.state.profile = new PatientProfile(data.profile);
                alert("Datos cargados correctamente");
                location.reload(); // Recargar para pintar DOM
            } catch(err) {
                alert("Error al leer archivo");
            }
        };
        reader.readAsText(file);
    },

    checkAutosave() {
        const saved = localStorage.getItem('cima_data');
        if(saved && confirm("¿Recuperar datos guardados?")) {
            this.loadFromFile({ target: { files: [new Blob([saved], {type: 'application/json'})] }});
        }
    }
};

// Iniciar al cargar DOM
document.addEventListener('DOMContentLoaded', () => CIMA_App.init());
window.CIMA_App = CIMA_App; // Exponer para HTML inline events