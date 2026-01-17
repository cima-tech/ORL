/* =========================================
   1. CORE & VARIABLES
   ========================================= */
:root {
  --primary: #0ea5e9;       /* Sky Blue */
  --accent: #22d3ee;        /* Cyan */
  --success: #10b981;       /* Emerald */
  --danger: #ef4444;        /* Red */
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  
  --glass-bg: rgba(15, 23, 42, 0.75);
  --glass-border: rgba(255, 255, 255, 0.1);
}

* { box-sizing: border-box; margin: 0; padding: 0; outline: none; }

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background-color: #0f172a; 
  background-size: cover; background-position: center; background-attachment: fixed;
  color: var(--text-main);
  min-height: 100vh; font-size: 14px; overflow-x: hidden;
}

body::before {
    content: ''; position: fixed; inset: 0;
    background: rgba(15, 23, 42, 0.6); z-index: -1; pointer-events: none;
}

.hidden { display: none !important; }

/* =========================================
   2. LOGIN SCREEN (Integrado y Limpio)
   ========================================= */
.login-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: #0f172a; 
    background-image: url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop');
    background-size: cover; background-position: center;
    display: flex; justify-content: center; align-items: center;
}
.login-overlay::before { content: ''; position: absolute; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(15px); }

.login-box {
    width: 100%; max-width: 380px; 
    background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px; padding: 30px; position: relative; z-index: 10;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.login-header { text-align: center; margin-bottom: 25px; }
.logo-big { 
    font-size: 2.5rem; font-weight: 800; letter-spacing: 2px; color: white;
    text-shadow: 0 0 20px var(--primary);
}
.login-header p { color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }

/* Tarjeta de Usuario en Login */
.user-list { display: flex; flex-direction: column; gap: 10px; }

.user-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px; padding: 12px; cursor: pointer;
    transition: all 0.2s ease;
}
.user-card:hover { background: rgba(255,255,255,0.08); border-color: var(--primary); }

.user-card-header { display: flex; align-items: center; gap: 15px; }

.user-avatar-lg {
    width: 42px; height: 42px; border-radius: 50%; 
    background: linear-gradient(135deg, var(--primary), var(--accent));
    display: flex; align-items: center; justify-content: center;
    font-weight: bold; color: white; font-size: 1rem;
    background-size: cover; background-position: center;
}

.user-info h3 { margin: 0; font-size: 0.95rem; color: white; }
.user-info p { margin: 0; font-size: 0.75rem; color: var(--text-muted); }

/* INPUT DE PASSWORD (DENTRO DE LA TARJETA) */
.password-area {
    margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);
    animation: slideDown 0.2s ease;
}
.password-input {
    width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--primary);
    padding: 8px; border-radius: 6px; color: white; text-align: center;
}
@keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

/* =========================================
   3. TOOLBAR FLOTANTE
   ========================================= */
.toolbar-container {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  z-index: 2000; display: flex; justify-content: center; pointer-events: none;
}

.floating-toolbar {
  pointer-events: auto; display: flex; align-items: center; gap: 20px;
  background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); padding: 8px 25px; border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.toolbar-group { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.icon-row { display: flex; align-items: center; gap: 8px; }
.group-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
.v-divider { width: 1px; height: 30px; background: rgba(255,255,255,0.15); }

.icon-btn {
  width: 38px; height: 38px; border-radius: 50%; border: none;
  background: rgba(255, 255, 255, 0.05); color: #cbd5e1; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.2s;
}
.icon-btn:hover { background: rgba(255,255,255,0.2); color: white; transform: scale(1.05); }

/* Avatar Toolbar */
.avatar-circle {
  width: 38px; height: 38px; border-radius: 50%; background-color: var(--primary);
  background-size: cover; color: transparent; border: 2px solid rgba(255,255,255,0.2);
  cursor: pointer;
}
.user-dropdown {
    position: absolute; top: 50px; right: 0; width: 220px;
    background: #1e293b; border: 1px solid var(--glass-border); border-radius: 12px;
    padding: 10px; display: flex; flex-direction: column; gap: 5px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.dropdown-item {
    padding: 8px; border-radius: 6px; color: #cbd5e1; background: transparent; border: none;
    text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px;
}
.dropdown-item:hover { background: rgba(255,255,255,0.1); color: white; }

/* =========================================
   4. CONTENEDOR PRINCIPAL
   ========================================= */
.container { max-width: 1100px; margin: 100px auto 40px auto; padding: 0 20px; }

.card, .visit-card {
  background: var(--glass-bg); backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border); border-radius: 16px;
  padding: 25px; margin-bottom: 20px;
}
.visit-card { border-left: 4px solid var(--primary); }

/* Inputs Corregidos */
.form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.span-4 { grid-column: span 4; } .span-2 { grid-column: span 2; }

.form-input {
  width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
  color: white; font-family: inherit;
}
.form-input:focus { border-color: var(--primary); outline: none; background: rgba(0,0,0,0.5); }

/* Checkbox Toggle Switch */
.checkbox-wrapper { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.checkbox-wrapper input { display: none; }
.checkbox-visual {
    width: 36px; height: 20px; background: rgba(255,255,255,0.1); border-radius: 20px;
    position: relative; transition: 0.3s; border: 1px solid rgba(255,255,255,0.2);
}
.checkbox-visual::after {
    content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px;
    background: white; border-radius: 50%; transition: 0.3s;
}
.checkbox-wrapper input:checked + .checkbox-visual { background: var(--success); border-color: var(--success); }
.checkbox-wrapper input:checked + .checkbox-visual::after { transform: translateX(16px); }
.checkbox-wrapper input:disabled + .checkbox-visual { opacity: 0.6; cursor: not-allowed; }

/* Chips */
.chips-container { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.chip {
    padding: 4px 12px; border-radius: 20px; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.2); font-size: 0.8rem; cursor: pointer; transition: 0.2s;
}
.chip:hover { border-color: var(--primary); color: white; }
.chip.active { background: rgba(14,165,233,0.2); border-color: var(--primary); color: var(--accent); }

/* =========================================
   5. PREVIEW & MODALS
   ========================================= */
/* Hoja de Papel */
.preview-shell {
    position: fixed; inset: 0; z-index: 1500; background: rgba(5, 10, 20, 0.95);
    display: flex; justify-content: center; overflow-y: auto; padding: 100px 0;
}
#docPreview {
    background: white; color: black; width: 21.59cm; min-height: 27.94cm;
    box-shadow: 0 0 50px rgba(0,0,0,0.8);
}

/* Modales (Fix: Ocultos por defecto) */
.modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 3000;
    display: none; /* <--- CRÍTICO */
    justify-content: center; align-items: center;
}
.modal-overlay.active { display: flex; animation: fadeIn 0.2s; }
.modal-box {
    background: #1e293b; padding: 30px; border-radius: 16px; width: 90%; max-width: 450px;
    border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

/* =========================================
   6. CONSOLE DRAWER (Mensajes)
   ========================================= */
#consoleDrawer {
    position: fixed; bottom: 0; left: 0; right: 0; height: 180px;
    background: #0f172a; border-top: 1px solid var(--primary); z-index: 9999;
    transform: translateY(100%); transition: transform 0.3s;
    display: flex; flex-direction: column; font-family: monospace; font-size: 0.8rem;
}
#consoleDrawer.open { transform: translateY(0); }
.console-header {
    background: rgba(255,255,255,0.05); padding: 5px 15px; display: flex; justify-content: space-between;
    color: var(--text-muted); font-size: 0.7rem; border-bottom: 1px solid rgba(255,255,255,0.1);
}
#consoleContent { flex: 1; overflow-y: auto; padding: 10px; color: #33ff00; }
.console-line { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 2px 0; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
