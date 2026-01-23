import { $, STATE, flash, fmtDate, showErr } from 'brain';
import { ServiceLoader } from './service_loader.js';

export const BillingManager = {
    init() {
        this.render();
    },

    render() {
        const container = document.getElementById('billing-workspace');
        if (!container) return;

        // Datos del paciente actual si existe
        const pNombre = $("#primer_nombre")?.value ? `${$("#primer_nombre").value} ${$("#primer_apellido").value}` : '';
        const pDoc = $("#documento_numero")?.value || '';

        container.innerHTML = `
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
                <div>
                    <div class="form-section">
                        <div class="form-section-title">Datos del Cliente</div>
                        <div class="form-grid">
                            <div class="span-2"><label class="form-label">Razón Social / Nombre</label><input id="bill-name" class="form-input" value="${pNombre}"></div>
                            <div class="span-2"><label class="form-label">RIF / CI</label><input id="bill-doc" class="form-input" value="${pDoc}"></div>
                            <div class="span-4"><label class="form-label">Dirección Fiscal</label><input id="bill-dir" class="form-input"></div>
                        </div>
                    </div>

                    <div class="form-section">
                        <div class="form-section-title">Conceptos</div>
                        <div id="bill-items">
                            <div class="bill-row" style="display:flex; gap:10px; margin-bottom:10px;">
                                <input class="form-input bill-desc" placeholder="Descripción" value="Consulta Médica Especializada" style="flex:2;">
                                <input type="number" class="form-input bill-qty" placeholder="Cant" value="1" style="width:60px;">
                                <input type="number" class="form-input bill-price" placeholder="Precio Unit" value="80.00" style="width:100px;">
                            </div>
                        </div>
                        <button class="btn btn-ghost btn-small" onclick="window.BillingManager.addItem()"><i class="bi bi-plus-lg"></i> Agregar Item</button>
                    </div>
                </div>

                <div style="background:rgba(0,0,0,0.2); padding:20px; border-radius:12px;">
                    <div class="form-section-title">Método de Pago</div>
                    <select id="payment-method" class="form-select" style="margin-bottom:15px;">
                        <optgroup label="Nacional">
                            <option value="Pago Móvil">Pago Móvil</option>
                            <option value="Transferencia Banesco">Transferencia (Bs)</option>
                            <option value="Punto de Venta">Punto de Venta</option>
                            <option value="Efectivo USD">Efectivo ($)</option>
                            <option value="Cashea">Cashea</option>
                        </optgroup>
                        <optgroup label="Internacional">
                            <option value="Zelle">Zelle</option>
                            <option value="PayPal">PayPal</option>
                            <option value="Stripe Link">Stripe / Tarjeta Int.</option>
                            <option value="Venmo">Venmo</option>
                            <option value="Binance">Binance / USDT</option>
                        </optgroup>
                    </select>
                    
                    <label class="form-label">Referencia / Nota</label>
                    <input id="payment-ref" class="form-input" placeholder="Ej: 123456" style="margin-bottom:20px;">

                    <div style="border-top:1px dashed #555; padding-top:10px; margin-top:10px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span>Subtotal:</span> <span id="bill-subtotal">80.00</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span>IVA (16%):</span> <span id="bill-tax">0.00</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:1.2rem; font-weight:bold; color:var(--primary);">
                            <span>TOTAL:</span> <span id="bill-total">80.00</span>
                        </div>
                    </div>

                    <button class="btn btn-success" style="width:100%; margin-top:20px;" onclick="window.BillingManager.generateInvoice()"><i class="bi bi-printer"></i> Generar Factura</button>
                </div>
            </div>
        `;
    },

    addItem() {
        const div = document.createElement('div');
        div.className = 'bill-row';
        div.style.cssText = "display:flex; gap:10px; margin-bottom:10px;";
        div.innerHTML = `
            <input class="form-input bill-desc" placeholder="Descripción" style="flex:2;">
            <input type="number" class="form-input bill-qty" placeholder="Cant" value="1" style="width:60px;">
            <input type="number" class="form-input bill-price" placeholder="Precio" style="width:100px;">
            <button class="btn btn-ghost text-danger" onclick="this.parentElement.remove()"><i class="bi bi-x"></i></button>
        `;
        document.getElementById('bill-items').appendChild(div);
    },

    async generateInvoice() {
        // Recopilar datos
        const client = {
            name: $('#bill-name').value,
            doc: $('#bill-doc').value,
            dir: $('#bill-dir').value
        };
        const method = $('#payment-method').value;
        const ref = $('#payment-ref').value;
        
        // Items
        const items = [];
        let total = 0;
        document.querySelectorAll('.bill-row').forEach(row => {
            const d = row.querySelector('.bill-desc').value;
            const q = parseFloat(row.querySelector('.bill-qty').value) || 0;
            const p = parseFloat(row.querySelector('.bill-price').value) || 0;
            if(d && q && p) {
                const sub = q*p;
                items.push({ desc: d, qty: q, price: p, sub: sub });
                total += sub;
            }
        });

        // Generar HTML del documento (Reutilizando estilos de documents.js si es posible, o inyectando propios)
        const user = STATE.currentUser.profile;
        const logo = STATE.currentUser.assets.header_path ? `<img src="${STATE.currentUser.assets.header_path}" style="max-height:80px;">` : '';

        const html = `
        <div class="doc-page doc-letter" style="font-family:'Roboto Condensed',sans-serif; color:black; padding:2cm; box-sizing:border-box;">
            <div style="text-align:center; margin-bottom:20px;">${logo}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid black; padding-bottom:10px; margin-bottom:20px;">
                <h1 style="margin:0; font-size:1.8rem;">FACTURA</h1>
                <div style="text-align:right;">
                    <div><strong>N° Control:</strong> ${Date.now().toString().slice(-6)}</div>
                    <div><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-VE')}</div>
                </div>
            </div>

            <div style="margin-bottom:30px;">
                <div><strong>Cliente:</strong> ${client.name}</div>
                <div><strong>RIF/CI:</strong> ${client.doc}</div>
                <div><strong>Dirección:</strong> ${client.dir}</div>
            </div>

            <table style="width:100%; border-collapse:collapse; margin-bottom:30px;">
                <thead>
                    <tr style="background:#eee; text-align:left;">
                        <th style="padding:8px;">Descripción</th>
                        <th style="padding:8px; width:60px;">Cant</th>
                        <th style="padding:8px; width:100px;">Precio</th>
                        <th style="padding:8px; width:100px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(i => `
                    <tr style="border-bottom:1px solid #ddd;">
                        <td style="padding:8px;">${i.desc}</td>
                        <td style="padding:8px;">${i.qty}</td>
                        <td style="padding:8px;">${i.price.toFixed(2)}</td>
                        <td style="padding:8px;">${i.sub.toFixed(2)}</td>
                    </tr>`).join('')}
                </tbody>
            </table>

            <div style="margin-left:auto; width:250px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <strong>Subtotal:</strong> <span>${total.toFixed(2)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:1.2rem; border-top:1px solid black; padding-top:5px;">
                    <strong>TOTAL:</strong> <span>${total.toFixed(2)} USD</span>
                </div>
            </div>

            <div style="margin-top:40px; border:1px solid #ccc; padding:10px; border-radius:4px; font-size:0.9rem;">
                <strong>Método de Pago:</strong> ${method} <br>
                <strong>Referencia:</strong> ${ref}
            </div>
        </div>`;

        // Renderizar en preview usando el shell existente
        const previewShell = document.getElementById('previewShell');
        const docPreview = document.getElementById('docPreview');
        docPreview.innerHTML = html;
        previewShell.classList.remove('hidden');
        STATE.UI.isPreviewMode = true;
        
        // Simular descarga (usa el mismo mecanismo de ExportManager)
        flash("Factura generada en vista previa");
    }
};

window.BillingManager = BillingManager;
