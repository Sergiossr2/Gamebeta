const productosCotizacion = [
    { codigo: 'N-001', producto: 'Tablilla PVC Groove Cafe Machimbre 25x5.95', precio: 190 },
    { codigo: 'N-002', producto: 'Tablilla PVC Groove Roja 25x5.95', precio: 205 },
    { codigo: 'N-003', producto: 'Tablilla PVC Madera Lisa Roja o Caoba 25x5.95', precio: 158 },
    { codigo: 'N-004', producto: 'Cornisa Blanco Mate', precio: 130 },
    { codigo: 'N-005', producto: 'Cornisa Madera Roja', precio: 130 },
    { codigo: 'N-006', producto: 'Cornisa Madera Groove Machimbre', precio: 130 },
    { codigo: 'N-007', producto: 'Angulo interior Blanco PVC', precio: 130 },
    { codigo: 'N-008', producto: 'Furring 7/8 x 12 Calibre .30', precio: 39 },
    { codigo: 'N-009', producto: 'Angulo para tabla yeso 1 1/2 x 12', precio: 19 },
    { codigo: 'N-010', producto: 'Canal de carga para tabla yeso 1 1/2 x 12', precio: 60 },
    { codigo: 'N-011', producto: 'Tornillo Tapicero punta fina', precio: 0.3 },
    { codigo: 'N-012', producto: 'Tornillo Frijolito punta broca #7', precio: 0.3 },
    { codigo: 'N-013', producto: 'Tornillo Frijolito punta fina #7', precio: 0.3 },
    { codigo: 'N-014', producto: 'Tablilla PVC Madera Cafe Claro Machimbre 20x5.95', precio: 140 },
    { codigo: 'N-015', producto: 'Tablilla PVC Blanco Madera 25x5.95', precio: 170 },
    { codigo: 'N-016', producto: 'Tablilla PVC Blanco Brillante 25x5.95', precio: 170 },
    { codigo: 'N-017', producto: 'Lamina Marmol 4x8 Blanco', precio: 800 },
    { codigo: 'N-018', producto: 'Perfil en J Cafe', precio: 130 },
    { codigo: 'N-019', producto: 'Clavos', precio: 0.5 },
    { codigo: 'N-020', producto: 'Libra de Alambre Galvanizado', precio: 35 },
    { codigo: 'N-021', producto: 'Sicaflex', precio: 220 },
    { codigo: 'N-022', producto: 'Esquinero exterior blanco', precio: 130 },
    { codigo: 'N-023', producto: 'Paral 1/2', precio: 45 },
    { codigo: 'N-024', producto: 'Union H Blanco', precio: 130 },
    { codigo: 'N-025', producto: 'Perfil J Blanco', precio: 130 },
    { codigo: 'N-026', producto: 'WPC', precio: 190 }
];

function opcionesProductosCotizacion() {
    return productosCotizacion
        .map(item => `<option value="${item.codigo}">${item.codigo} - ${item.producto}</option>`)
        .join('');
}

vistas['cotizaciones'] = `
    <section class="quote-page">
        <div class="container section quote-shell">
            <div class="quote-toolbar no-print">
                <div>
                    <span class="section-eyebrow">Cotizador</span>
                    <h2 class="section-title">Crear cotizacion</h2>
                    <p class="section-subtitle">Agrega productos, ajusta cantidades y genera el total al instante.</p>
                </div>
                <div class="quote-toolbar-actions">
                    <button class="button button-secondary" type="button" id="quote-clear">Limpiar</button>
                    <button class="button button-secondary" type="button" id="quote-print">Imprimir</button>
                    <button class="button button-secondary" type="button" id="quote-download">Descargar imagen</button>
                    <button class="button" type="button" id="quote-whatsapp">Enviar por WhatsApp</button>
                </div>
            </div>

            <article class="quote-document" id="quote-document">
                <div class="quote-document-header">
                    <div class="quote-brand-block">
                        <img src="IMG/Logo2.jpeg" alt="PVC Solutions HN" class="quote-logo">
                        <div>
                            <h3>PVC SOLUTIONS</h3>
                            <p>Material de pura calidad al mejor precio</p>
                        </div>
                    </div>
                    <div class="quote-meta">
                        <label>Fecha:
                            <input type="text" id="quote-date" readonly>
                        </label>
                        <label>N. de factura:
                            <input type="text" id="quote-number">
                        </label>
                        <label>Id. del cliente:
                            <input type="text" id="quote-client-id" placeholder="Opcional">
                        </label>
                    </div>
                </div>

                <div class="quote-company">
                    <p>PVC SOLUTIONS HN</p>
                    <p>RESIDENCIAL COSTAS DEL SOL ETAPA 4</p>
                    <p>San Pedro Sula, 21101</p>
                    <p>9407-8458</p>
                </div>

                <div class="quote-people-grid">
                    <label>
                        <span>Vendedor</span>
                        <input type="text" id="quote-seller" value="Sergio Samir" readonly>
                    </label>
                    <label>
                        <span>Cliente</span>
                        <input type="text" id="quote-client" placeholder="Nombre del cliente">
                    </label>
                </div>

                <div class="quote-table-wrap">
                    <table class="quote-table" aria-label="Detalle de cotizacion">
                        <thead>
                            <tr>
                                <th class="quote-col-qty">Cant.</th>
                                <th>Descripcion</th>
                                <th class="quote-col-price">Precio por unidad</th>
                                <th class="quote-col-total">Total de linea</th>
                                <th class="quote-col-action no-print"></th>
                            </tr>
                        </thead>
                        <tbody id="quote-lines"></tbody>
                    </table>
                </div>

                <button class="quote-add-line no-print" type="button" id="quote-add-line">Agregar producto</button>

                <div class="quote-summary">
                    <div></div>
                    <div class="quote-summary-box">
                        <label>
                            <span>Subtotal</span>
                            <output id="quote-subtotal">L 0.00</output>
                        </label>
                        <label>
                            <span>Descuento</span>
                            <output id="quote-discount">L 0.00</output>
                        </label>
                        <label class="quote-total-row">
                            <span>Total</span>
                            <output id="quote-total">L 0.00</output>
                        </label>
                    </div>
                </div>

                <p class="quote-note">Todos Las facturas de compras se extenderan a nombre de la empresa: PVC SOLUTIONS HN</p>
                <strong class="quote-thanks">Gracias por su confianza.</strong>
            </article>
        </div>
    </section>
`;

function initCotizador() {
    const tableBody = document.getElementById('quote-lines');
    if (!tableBody || tableBody.dataset.ready === 'true') return;
    tableBody.dataset.ready = 'true';

    const money = new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL',
        minimumFractionDigits: 2
    });

    const fields = {
        date: document.getElementById('quote-date'),
        number: document.getElementById('quote-number'),
        clientId: document.getElementById('quote-client-id'),
        seller: document.getElementById('quote-seller'),
        client: document.getElementById('quote-client'),
        discount: document.getElementById('quote-discount'),
        subtotal: document.getElementById('quote-subtotal'),
        total: document.getElementById('quote-total')
    };

    function findProduct(code) {
        return productosCotizacion.find(item => item.codigo === code) || productosCotizacion[0];
    }

    function formatNumber(value) {
        return money.format(Number(value) || 0);
    }

    function createLine(code = 'N-001', qty = 1) {
        const product = code ? findProduct(code) : null;
        const row = document.createElement('tr');
        row.className = 'quote-line';
        row.innerHTML = `
            <td>
                <input class="quote-qty" type="number" min="0" step="0.01" value="${qty}">
            </td>
            <td>
                <select class="quote-product">
                    <option value="">Seleccionar producto</option>
                    ${opcionesProductosCotizacion()}
                </select>
            </td>
            <td>
                <input class="quote-price" type="number" min="0" step="0.01" value="${product ? product.precio : 0}">
            </td>
            <td>
                <output class="quote-line-total">L 0.00</output>
            </td>
            <td class="no-print">
                <button class="quote-remove-line" type="button" aria-label="Eliminar linea">X</button>
            </td>
        `;
        row.querySelector('.quote-product').value = product ? product.codigo : '';
        tableBody.appendChild(row);
        updateTotals();
    }

    function updateLineProduct(row) {
        const code = row.querySelector('.quote-product').value;
        const product = code ? findProduct(code) : null;
        row.querySelector('.quote-price').value = product ? product.precio : 0;
        updateTotals();
    }

    function getLineData(row) {
        const code = row.querySelector('.quote-product').value;
        const product = code ? findProduct(code) : { codigo: '', producto: 'Producto sin seleccionar', precio: 0 };
        const qty = Number(row.querySelector('.quote-qty').value) || 0;
        const price = Number(row.querySelector('.quote-price').value) || 0;
        return {
            product,
            qty,
            price,
            total: qty * price
        };
    }

    function updateTotals() {
        let subtotal = 0;
        tableBody.querySelectorAll('tr').forEach(row => {
            const line = getLineData(row);
            subtotal += line.total;
            row.querySelector('.quote-line-total').textContent = formatNumber(line.total);
        });

        fields.subtotal.textContent = formatNumber(subtotal);
        fields.discount.textContent = formatNumber(0);
        fields.total.textContent = formatNumber(subtotal);
    }

    function resetQuote() {
        tableBody.innerHTML = '';
        updateTotals();
    }

    function buildWhatsAppText() {
        const rows = Array.from(tableBody.querySelectorAll('tr'))
            .map(getLineData)
            .filter(line => line.qty > 0)
            .map(line => `- ${line.qty} x ${line.product.producto} (${formatNumber(line.price)}): ${formatNumber(line.total)}`)
            .join('\n');

        return [
            'Hola, quiero generar esta cotizacion:',
            `Factura: ${fields.number.value}`,
            `Cliente: ${fields.client.value || 'Sin nombre'}`,
            `Vendedor: ${fields.seller.value || 'Sin vendedor'}`,
            '',
            rows || 'Sin productos agregados.',
            '',
            `Subtotal: ${fields.subtotal.textContent}`,
            `Descuento: ${fields.discount.textContent}`,
            `Total: ${fields.total.textContent}`
        ].join('\n');
    }

    function getQuoteRows() {
        return Array.from(tableBody.querySelectorAll('tr'))
            .map(getLineData)
            .filter(line => line.product.codigo && line.qty > 0);
    }

    function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = String(text).split(' ');
        let line = '';
        let currentY = y;

        words.forEach(word => {
            const testLine = line ? `${line} ${word}` : word;
            if (ctx.measureText(testLine).width > maxWidth && line) {
                ctx.fillText(line, x, currentY);
                line = word;
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        });

        if (line) ctx.fillText(line, x, currentY);
        return currentY + lineHeight;
    }

    function drawFallbackLogo(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(95, 95, 58, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#0d2b47';
        ctx.stroke();
        ctx.fillStyle = '#2e8bbd';
        ctx.font = '700 26px Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PVC', 95, 91);
        ctx.fillStyle = '#0d2b47';
        ctx.font = '700 15px Segoe UI, Arial';
        ctx.fillText('SOLUTIONS', 95, 114);
        ctx.restore();
    }

    function loadQuoteLogo() {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = 'IMG/Logo2.jpeg';
        });
    }

    function saveCanvasAsPng(canvas, filename) {
        canvas.toBlob(blob => {
            if (!blob) {
                alert('No se pudo generar la imagen. Proba abrir la pagina desde un servidor local o GitHub Pages.');
                return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, 'image/png');
    }

    async function downloadQuoteImage() {
        const rows = getQuoteRows();
        const rowHeight = 34;
        const width = 1200;
        const height = Math.max(820, 520 + rows.length * rowHeight);
        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        const logo = await loadQuoteLogo();
        if (logo) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(95, 95, 60, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logo, 35, 35, 120, 120);
            ctx.restore();
        } else {
            drawFallbackLogo(ctx);
        }

        ctx.fillStyle = '#00284c';
        ctx.font = '700 26px Segoe UI, Arial';
        ctx.fillText('PVC SOLUTIONS', 190, 78);
        ctx.font = '18px Segoe UI, Arial';
        ctx.fillText('Material de pura calidad al mejor precio', 190, 106);

        ctx.font = '700 18px Segoe UI, Arial';
        ctx.fillText('Fecha:', 820, 72);
        ctx.fillText(fields.date.value, 930, 72);
        ctx.fillText('N. de factura:', 820, 106);
        ctx.fillText(fields.number.value, 975, 106);
        ctx.fillText('Id. del cliente:', 820, 140);
        ctx.fillText(fields.clientId.value || '', 975, 140);

        ctx.strokeStyle = '#0d2b47';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(34, 180);
        ctx.lineTo(width - 34, 180);
        ctx.stroke();

        ctx.fillStyle = '#001b35';
        ctx.font = '17px Segoe UI, Arial';
        ctx.fillText('PVC SOLUTIONS HN', 190, 222);
        ctx.fillText('RESIDENCIAL COSTAS DEL SOL ETAPA 4', 190, 252);
        ctx.fillText('San Pedro Sula, 21101', 190, 282);
        ctx.fillText('9407-8458', 190, 312);

        ctx.fillStyle = '#1b5f98';
        ctx.fillRect(34, 342, 560, 34);
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 19px Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Vendedor', 174, 365);
        ctx.fillText('Cliente', 454, 365);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#c6eafa';
        ctx.fillRect(34, 376, 560, 34);
        ctx.fillStyle = '#001b35';
        ctx.font = '18px Segoe UI, Arial';
        ctx.fillText(fields.seller.value || '', 48, 399);
        ctx.fillText(fields.client.value || '', 328, 399);

        const tableY = 460;
        ctx.fillStyle = '#0d6da9';
        ctx.fillRect(34, tableY, width - 68, 36);
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 17px Segoe UI, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Cant.', 92, tableY + 24);
        ctx.fillText('Descripcion', 430, tableY + 24);
        ctx.fillText('Precio por unidad', 830, tableY + 24);
        ctx.fillText('Total de linea', 1040, tableY + 24);
        ctx.textAlign = 'left';

        ctx.font = '16px Segoe UI, Arial';
        let y = tableY + 36;
        rows.forEach((line, index) => {
            ctx.fillStyle = index % 2 === 0 ? '#c6eafa' : '#ffffff';
            ctx.fillRect(34, y, width - 68, rowHeight);
            ctx.fillStyle = '#001b35';
            ctx.fillText(String(line.qty), 48, y + 23);
            wrapCanvasText(ctx, line.product.producto, 190, y + 23, 520, 18);
            ctx.textAlign = 'right';
            ctx.fillText(formatNumber(line.price), 900, y + 23);
            ctx.font = '700 16px Segoe UI, Arial';
            ctx.fillText(formatNumber(line.total), width - 54, y + 23);
            ctx.font = '16px Segoe UI, Arial';
            ctx.textAlign = 'left';
            y += rowHeight;
        });

        const subtotal = rows.reduce((sum, line) => sum + line.total, 0);
        const discount = 0;
        const total = subtotal;
        y += 22;
        ctx.font = '700 18px Segoe UI, Arial';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#001b35';
        ctx.fillText('Subtotal', 925, y);
        ctx.fillStyle = '#c6eafa';
        ctx.fillRect(950, y - 24, 196, 30);
        ctx.fillStyle = '#001b35';
        ctx.font = '17px Segoe UI, Arial';
        ctx.fillText(formatNumber(subtotal), 1134, y);

        y += 38;
        ctx.font = '700 18px Segoe UI, Arial';
        ctx.fillText('Descuento', 925, y);
        ctx.fillStyle = '#c6eafa';
        ctx.fillRect(950, y - 24, 196, 30);
        ctx.fillStyle = '#001b35';
        ctx.font = '17px Segoe UI, Arial';
        ctx.fillText(formatNumber(discount), 1134, y);

        y += 44;
        ctx.font = '700 20px Segoe UI, Arial';
        ctx.fillText('Total', 925, y);
        ctx.fillStyle = '#c6eafa';
        ctx.fillRect(950, y - 27, 196, 34);
        ctx.fillStyle = '#001b35';
        ctx.fillText(formatNumber(total), 1134, y);

        ctx.textAlign = 'center';
        ctx.font = '17px Segoe UI, Arial';
        ctx.fillText('Todos Las facturas de compras se extenderan a nombre de la empresa: PVC SOLUTIONS HN', width / 2, height - 74);
        ctx.font = '700 20px Segoe UI, Arial';
        ctx.fillText('Gracias por su confianza.', width / 2, height - 36);

        saveCanvasAsPng(canvas, `cotizacion-${fields.number.value || 'pvc-solutions'}.png`);
    }

    tableBody.addEventListener('input', event => {
        if (event.target.matches('.quote-qty, .quote-price')) updateTotals();
    });

    tableBody.addEventListener('change', event => {
        if (event.target.matches('.quote-product')) updateLineProduct(event.target.closest('tr'));
    });

    tableBody.addEventListener('click', event => {
        if (!event.target.matches('.quote-remove-line')) return;
        event.target.closest('tr').remove();
        updateTotals();
    });

    document.getElementById('quote-add-line')?.addEventListener('click', () => createLine('', 1));
    document.getElementById('quote-clear')?.addEventListener('click', resetQuote);
    document.getElementById('quote-print')?.addEventListener('click', () => window.print());
    document.getElementById('quote-download')?.addEventListener('click', downloadQuoteImage);
    document.getElementById('quote-whatsapp')?.addEventListener('click', () => {
        window.open(`https://wa.me/50494078458?text=${encodeURIComponent(buildWhatsAppText())}`, '_blank');
    });

    const now = new Date();
    fields.date.value = now.toLocaleString('es-HN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    fields.number.value = String(Math.floor(100000 + Math.random() * 900000));
    fields.clientId.value = fields.number.value;

    resetQuote();
}
