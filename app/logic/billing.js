import { $, STATE, flash, fmtDate, showErr } from 'brain';
import { ExportManager } from 'export_manager';

export const BillingManager = {
    currentDraft: null,

    init() {
        this.render();
    },

    // Llamado desde CONSULTA al guardar
    createDraftFromConsult(consultData) {
        const patientName = $("#primer_nombre").value + " " + $("#primer_apellido").value;
        const fee = STATE.currentUser.commercial.consultation_fee || 0;
        
        this.currentDraft = {
            client: {
                name: patientName,
                doc: $("#documento_numero").value,
                phone: $("#tel_principal").value,
                dir: $("#dir_calle_num").value || "Ciudad"
            },
            items: [
                { desc: `Consulta Médica (${consultData.type})`, qty: 1, price: fee, sub: fee }
            ],
            total: fee
        };
        // Opcional: Guardar en localStorage como 'pendientes'
        this.savePendingBill(this.currentDraft);
    },

    savePendingBill(bill) {
        let pendings = JSON.parse(localStorage.getItem('CIMA_BILLING_PENDING') || '[]');
        pendings.push({ ...bill, date: new Date().toISOString() });
        localStorage.setItem('CIMA_BILLING_PENDING', JSON.stringify(pendings));
    },

    render() {
        const container = document.getElementById('billing-workspace');
        if (!container) return;

        // Intentar cargar datos del paciente actual si no hay draft
        const pNombre = $("#primer_nombre")?.value ? `${$("#primer_nombre").value} ${$("#primer_apellido").value}` : '';
        const pDoc = $("#documento_numero")?.value || '';
        const pTlf = $("#tel_principal")?.value || '';
        
        // Default Fee
        const defFee = STATE.currentUser.commercial?.consultation_fee || 0;

        container.innerHTML = `
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
                <div>
                    <div class="form-section">
                        <div class="form-section-title">Datos del Cliente</div>
                        <div class="form-grid">
                            <div class="span-2"><label class="form-label">Razón Social / Nombre</label><input id="bill-name" class="form-input" value="${pNombre}"></div>
                            <div class="span-1"><label class="form-label">RIF / CI</label><input id="bill-doc" class="form-input" value="${pDoc}"></div>
                            <div class="span-1"><label class="form-label">Teléfono</label><input id="bill-phone" class="form-input" value="${pTlf}"></div>
                            <div class="span-4"><label class="form-label">Dirección Fiscal</label><input id="bill-dir" class="form-input" placeholder="Dirección..."></div>
                        </div>
                    </div>

                    <div class="form-section">
                        <div class="form-section-title">Conceptos</div>
                        <div id="bill-items">
                            <div class="bill-row" style="display:flex; gap:10px; margin-bottom:10px;">
                                <input class="form-input bill-desc" placeholder="Descripción" value="Consulta Médica Especializada" style="flex:2;">
                                <input type="number" class="form-input bill-qty" placeholder="Cant" value="1" style="width:60px;" onchange="window.BillingManager.calcTotal()">
                                <input type="number" class="form-input bill-price" placeholder="Precio Unit" value="${defFee}" style="width:100px;" onchange="window.BillingManager.calcTotal()">
                                <button class="btn btn-ghost text-danger" onclick="this.parentElement.remove(); window.BillingManager.calcTotal()"><i class="bi bi-x"></i></button>
                            </div>
                        </div>
                        <button class="btn btn-ghost btn-small" onclick="window.BillingManager.addItem()"><i class="bi bi-plus-lg"></i> Agregar Item</button>
                    </div>
                </div>

                <div style="background:rgba(0,0,0,0.2); padding:20px; border-radius:12px; height:fit-content;">
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
                            <option value="Binance">Binance / USDT</option>
                        </optgroup>
                    </select>
                    
                    <label class="form-label">Referencia / Nota</label>
                    <input id="payment-ref" class="form-input" placeholder="Ej: 123456" style="margin-bottom:20px;">

                    <div style="border-top:1px dashed #555; padding-top:10px; margin-top:10px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span>Subtotal:</span> <span id="bill-subtotal">0.00</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span>IVA (Exento):</span> <span id="bill-tax">0.00</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:1.4rem; font-weight:bold; color:var(--primary); margin-top:10px;">
                            <span>TOTAL:</span> <span id="bill-total">0.00</span>
                        </div>
                    </div>

                    <div style="margin-top:20px; display:flex; gap:10px;">
                        <button class="btn btn-primary" style="flex:1;" onclick="window.BillingManager.generateInvoice()"><i class="bi bi-eye"></i> Previa</button>
                        <button class="btn btn-success" style="flex:1;" onclick="window.BillingManager.exportInvoice()"><i class="bi bi-download"></i> Emitir</button>
                    </div>
                </div>
            </div>
        `;
        this.calcTotal();
    },

    addItem() {
        const div = document.createElement('div');
        div.className = 'bill-row';
        div.style.cssText = "display:flex; gap:10px; margin-bottom:10px;";
        div.innerHTML = `
            <input class="form-input bill-desc" placeholder="Descripción" style="flex:2;">
            <input type="number" class="form-input bill-qty" placeholder="Cant" value="1" style="width:60px;" onchange="window.BillingManager.calcTotal()">
            <input type="number" class="form-input bill-price" placeholder="Precio" style="width:100px;" onchange="window.BillingManager.calcTotal()">
            <button class="btn btn-ghost text-danger" onclick="this.parentElement.remove(); window.BillingManager.calcTotal()"><i class="bi bi-x"></i></button>
        `;
        document.getElementById('bill-items').appendChild(div);
    },

    calcTotal() {
        let total = 0;
        document.querySelectorAll('.bill-row').forEach(row => {
            const q = parseFloat(row.querySelector('.bill-qty').value) || 0;
            const p = parseFloat(row.querySelector('.bill-price').value) || 0;
            total += q * p;
        });
        const elSub = document.getElementById('bill-subtotal');
        const elTot = document.getElementById('bill-total');
        if(elSub) elSub.textContent = total.toFixed(2);
        if(elTot) elTot.textContent = total.toFixed(2) + " " + (STATE.currentUser.commercial?.currency || '$');
    },

    getBillData() {
        const items = [];
        let total = 0;
        document.querySelectorAll('.bill-row').forEach(row => {
            const d = row.querySelector('.bill-desc').value;
            const q = parseFloat(row.querySelector('.bill-qty').value) || 0;
            const p = parseFloat(row.querySelector('.bill-price').value) || 0;
            if(d && q) {
                items.push({ desc: d, qty: q, price: p, sub: q*p });
                total += q*p;
            }
        });

        return {
            client: {
                name: $('#bill-name').value,
                doc: $('#bill-doc').value,
                phone: $('#bill-phone').value,
                dir: $('#bill-dir').value
            },
            method: $('#payment-method').value,
            ref: $('#payment-ref').value,
            items: items,
            total: total,
            currency: STATE.currentUser.commercial?.currency || '$',
            control: Date.now().toString().slice(-6),
            date: new Date()
        };
    },

    buildInvoiceHTML(data) {
        const user = STATE.currentUser.profile;
        const logo = STATE.currentUser.assets.header_path ? `<img src="${STATE.currentUser.assets.header_path}" style="max-height:100px;">` : '';
        const sign = STATE.currentUser.assets.signature_path ? `<img src="${STATE.currentUser.assets.signature_path}" style="max-height:80px;">` : '';

        // Reutilizamos estilo base de documents.js (Roboto Condensed)
        return `
        <div class="doc-page doc-letter" style="padding:2cm; font-family:'Roboto Condensed', sans-serif; display:flex; flex-direction:column; color:black;">
            <div style="text-align:center; margin-bottom:20px;">${logo}</div>
            
            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:20px;">
                <div>
                    <h1 style="margin:0; font-size:2rem; letter-spacing:2px;">FACTURA</h1>
                    <div style="font-size:0.9rem;">ORIGINAL</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.2rem; font-weight:bold; color:#ef4444;">N° ${data.control}</div>
                    <div>Fecha: ${fmtDate(data.date.toISOString())}</div>
                </div>
            </div>

            <div style="margin-bottom:30px; display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                <div>
                    <strong>CLIENTE:</strong><br>
                    ${data.client.name}<br>
                    ${data.client.doc}<br>
                    ${data.client.phone}
                </div>
                <div>
                    <strong>DIRECCIÓN:</strong><br>
                    ${data.client.dir || '—'}
                </div>
            </div>

            <table style="width:100%; border-collapse:collapse; margin-bottom:auto;">
                <thead>
                    <tr style="background:#f1f5f9; border-bottom:2px solid #000;">
                        <th style="padding:8px; text-align:left;">DESCRIPCIÓN</th>
                        <th style="padding:8px; text-align:center; width:60px;">CANT</th>
                        <th style="padding:8px; text-align:right; width:100px;">PRECIO</th>
                        <th style="padding:8px; text-align:right; width:100px;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map(i => `
                    <tr style="border-bottom:1px solid #e2e8f0;">
                        <td style="padding:10px 8px;">${i.desc}</td>
                        <td style="padding:10px 8px; text-align:center;">${i.qty}</td>
                        <td style="padding:10px 8px; text-align:right;">${i.price.toFixed(2)}</td>
                        <td style="padding:10px 8px; text-align:right;">${i.sub.toFixed(2)}</td>
                    </tr>`).join('')}
                </tbody>
            </table>

            <div style="margin-top:20px; border-top:2px solid #000; padding-top:10px; display:flex; justify-content:flex-end;">
                <div style="text-align:right; min-width:200px;">
                    <div style="display:flex; justify-content:space-between; font-size:1.1rem;">
                        <strong>TOTAL A PAGAR:</strong>
                        <span>${data.total.toFixed(2)} ${data.currency}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top:40px; display:flex; gap:20px; align-items:flex-end;">
                <div style="flex:1; font-size:0.8rem; border:1px solid #ccc; padding:10px; border-radius:4px;">
                    <strong>FORMA DE PAGO:</strong> ${data.method}<br>
                    <strong>REFERENCIA:</strong> ${data.ref || '—'}<br>
                    <div style="margin-top:5px; font-style:italic;">Gracias por su confianza.</div>
                </div>
                <div style="text-align:center;">
                    ${sign}
                    <div style="border-top:1px solid #000; width:150px; margin-top:5px;"></div>
                    Firma Autorizada
                </div>
            </div>
        </div>`;
    },

    generateInvoice() {
        const data = this.getBillData();
        const html = this.buildInvoiceHTML(data);
        
        const previewShell = document.getElementById('previewShell');
        const docPreview = document.getElementById('docPreview');
        docPreview.innerHTML = html;
        previewShell.classList.remove('hidden');
        STATE.UI.isPreviewMode = true;
        STATE.currentPreviewDoc = 'BILL'; // Marca especial para saber que es factura
        
        // Importar toolbar para actualizar botones si es necesario
        import('toolbar').then(m => m.renderToolbar());
    },

    exportInvoice() {
        // Usar ExportManager. Utiliza la logica generica
        const data = this.getBillData();
        const html = this.buildInvoiceHTML(data);
        
        // Crear mock card para engañar al export manager o adaptar export manager
        // Mejor opción: crear contenedor temporal aquí mismo
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        tempDiv.style.position = 'absolute'; tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        html2canvas(tempDiv.querySelector('.doc-page'), { scale: 2 }).then(canvas => {
            document.body.removeChild(tempDiv);
            const filename = `${data.client.doc}_FACTURA_${data.control}.png`;
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL();
            link.click();
            flash("Factura descargada");
        });
    }
};

window.BillingManager = BillingManager;
