vistas['inicio'] = `
    <!-- MODAL -->
    <div id="product-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
        <div class="modal-box">
            <button class="modal-close" id="modal-close" aria-label="Cerrar">✕</button>
            <div class="modal-img-wrap">
                <img id="modal-img" src="" alt="" loading="lazy">
                <span id="modal-badge" class="modal-badge"></span>
            </div>
            <div class="modal-body">
                <span id="modal-category" class="modal-category"></span>
                <h3 id="modal-title"></h3>
                <p id="modal-desc"></p>
                <ul id="modal-features" class="modal-features"></ul>
                <a id="modal-cta" class="button button-whatsapp" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L.057 23.943l6.224-1.463A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.7.87.934-3.607-.235-.371A9.818 9.818 0 1112 21.818z"/>
                    </svg>
                    Cotizar por WhatsApp
                </a>
            </div>
        </div>
    </div>

    <!-- HERO -->
    <section class="hero">
        <div class="hero-overlay"></div>
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <span class="hero-label">Calidad OSDA certificada</span>
                    <h2>Soluciones de techo y pared con PVC resistente</h2>
                    <p>Ofrecemos láminas, paneles y accesorios de PVC especialmente diseñados para techos, paredes y cubiertas en Honduras.</p>
                    <div class="hero-ctas">
                        <a class="button" href="?pagina=inicio&seccion=productos">Ver productos</a>
                        <a class="button button-ghost" href="?pagina=inicio&seccion=contacto">Contactar</a>
                    </div>
                </div>
                <div class="hero-cards">
                    <div class="hero-card-item">
                        <div class="card-icon">🚚</div>
                        <div class="card-text">
                            <h3>Entrega rápida</h3>
                            <p>Logística confiable para que tus pedidos lleguen a tiempo.</p>
                        </div>
                    </div>
                    <div class="hero-card-item">
                        <div class="card-icon">🔧</div>
                        <div class="card-text">
                            <h3>Soporte técnico</h3>
                            <p>Asesoría especializada para elegir el mejor material.</p>
                        </div>
                    </div>
                    <div class="hero-card-item">
                        <div class="card-icon">📐</div>
                        <div class="card-text">
                            <h3>A tu medida</h3>
                            <p>Cortamos y adaptamos según las necesidades de tu proyecto.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- STATS -->
    <div class="stats-bar">
        <div class="container stats-inner">
            <div class="stat-item">
                <span class="stat-number" data-target="500" data-suffix="+">500+</span>
                <span class="stat-label">Proyectos completados</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <span class="stat-number" data-target="5" data-suffix=" años">5 años</span>
                <span class="stat-label">De experiencia</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <span class="stat-number" data-target="100" data-suffix="%">100%</span>
                <span class="stat-label">Garantía de calidad</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
                <span class="stat-number">CDS</span>
                <span class="stat-label">Costa de Sol, HN</span>
            </div>
        </div>
    </div>

    <!-- PRODUCTOS -->
    <section id="productos" class="container section">
        <div class="section-header">
            <span class="section-eyebrow">Catálogo</span>
            <h2 class="section-title">Nuestros Productos</h2>
            <p class="section-subtitle">Materiales de primera calidad para cada etapa de tu construcción</p>
        </div>

        <!-- Láminas de techo -->
        <div class="catalog-group">
            <h3 class="catalog-group-title">
                <span class="catalog-group-icon">🏠</span> Láminas de PVC para Techo
            </h3>
            <div class="products">
                <article class="product-card" data-modal
                    data-img="IMG/Blaco_Brillante_Liso.jpeg"
                    data-badge="Tablillas PVC"
                    data-category="Láminas de Techo"
                    data-title="Blanco Brillante Liso"
                    data-desc="Lámina PVC color blanco brillante, 25 cm x 5.95 m. Ideal para techos y cubiertas con apariencia limpia y moderna."
                    data-features="Medidas 25 cm x 5.95 m|Fácil limpieza y mantenimiento|Resistente al agua y la humedad"
                    data-wa="Hola,%20quiero%20cotizar%20Blanco%20Brillante%20Liso">
                    <div class="product-card-top">
                        <span class="product-type">Blanco Brillante</span>
                        <img src="IMG/Blaco_Brillante_Liso.jpeg" alt="Lámina PVC Blanco Brillante" class="product-image" loading="lazy">
                    </div>
                    <div class="product-card-body">
                        <h3>Blanco Brillante Liso</h3>
                        <p>Lámina PVC 25 cm x 5.95 m, perfecta para techos blancos y luminosos.</p>
                        <button class="button button-secondary open-modal-btn">Ver detalles →</button>
                    </div>
                </article>

                <article class="product-card" data-modal
                    data-img="IMG/Blanco_Madera_Liso.jpeg"
                    data-badge="Tablillas PVC"
                    data-category="Láminas de Techo"
                    data-title="Blanco Madera Liso"
                    data-desc="Lámina PVC color blanco madera, 25 cm x 5.95 m. Aporta un acabado elegante con textura suave."
                    data-features="Medidas 25 cm x 5.95 m|Acabado madera suave|Resistente al sol y a la lluvia"
                    data-wa="Hola,%20quiero%20cotizar%20Blanco%20Madera%20Liso">
                    <div class="product-card-top">
                        <span class="product-type">Blanco Madera</span>
                        <img src="IMG/Blanco_Madera_Liso.jpeg" alt="Lámina PVC Blanco Madera" class="product-image" loading="lazy">
                    </div>
                    <div class="product-card-body">
                        <h3>Blanco Madera Liso</h3>
                        <p>Lámina PVC 25 cm x 5.95 m con acabado tipo madera claro.</p>
                        <button class="button button-secondary open-modal-btn">Ver detalles →</button>
                    </div>
                </article>

                <article class="product-card product-card--featured" data-modal
                    data-img="IMG/Madera_cafe_claro_Machimbre.jpeg"
                    data-badge="Tablillas PVC"
                    data-category="Láminas de Techo"
                    data-title="Madera Café Claro Machimbre"
                    data-desc="Lámina PVC machimbre color madera café claro, 20 cm x 5.95 m. Acabado natural ideal para interiores y techos decorativos."
                    data-features="Medidas 20 cm x 5.95 m|Textura machimbre auténtica|Acabado cálido tipo madera"
                    data-wa="Hola,%20quiero%20cotizar%20Madera%20Café%20Claro%20Machimbre">
                    <div class="product-card-top">
                        <span class="product-type">Café Claro</span>
                        <img src="IMG/Madera_cafe_claro_Machimbre.jpeg" alt="Lámina PVC Madera Café Claro Machimbre" class="product-image" loading="lazy">
                    </div>
                    <div class="product-card-body">
                        <h3>Madera Café Claro Machimbre</h3>
                        <p>Lámina PVC 20 cm x 5.95 m con diseño machimbre para un acabado natural.</p>
                        <button class="button button-secondary open-modal-btn">Ver detalles →</button>
                    </div>
                </article>

                <article class="product-card" data-modal
                    data-img="IMG/Madera_cafe_Machimbre.jpeg"
                    data-badge="Tablillas PVC"
                    data-category="Láminas de Techo"
                    data-title="Madera Café Machimbre"
                    data-desc="Lámina PVC machimbre color café, 25 cm x 5.95 m. Ideal para techos con estilo rústico y moderno."
                    data-features="Medidas 25 cm x 5.95 m|Textura machimbre auténtica|Resistente a la humedad"
                    data-wa="Hola,%20quiero%20cotizar%20Madera%20Café%20Machimbre">
                    <div class="product-card-top">
                        <span class="product-type">Café Machimbre</span>
                        <img src="IMG/Madera_cafe_Machimbre.jpeg" alt="Lámina PVC Madera Café Machimbre" class="product-image" loading="lazy">
                    </div>
                    <div class="product-card-body">
                        <h3>Madera Café Machimbre</h3>
                        <p>Lámina PVC 25 cm x 5.95 m con acabado machimbre resistente.</p>
                        <button class="button button-secondary open-modal-btn">Ver detalles →</button>
                    </div>
                </article>

                <article class="product-card" data-modal
                    data-img="IMG/Madera_Lisa_Caoba.jpeg"
                    data-badge="Tablillas PVC"
                    data-category="Láminas de Techo"
                    data-title="Madera Lisa Caoba"
                    data-desc="Lámina PVC color caoba lisa, 25 cm x 5.95 m. Elegante y perfecta para techos decorativos."
                    data-features="Medidas 25 cm x 5.95 m|Acabado liso tipo caoba|Resistente a la decoloración"
                    data-wa="Hola,%20quiero%20cotizar%20Madera%20Lisa%20Caoba">
                    <div class="product-card-top">
                        <span class="product-type">Caoba</span>
                        <img src="IMG/Madera_Lisa_Caoba.jpeg" alt="Lámina PVC Madera Lisa Caoba" class="product-image" loading="lazy">
                    </div>
                    <div class="product-card-body">
                        <h3>Madera Lisa Caoba</h3>
                        <p>Lámina PVC 25 cm x 5.95 m con acabado liso color caoba.</p>
                        <button class="button button-secondary open-modal-btn">Ver detalles →</button>
                    </div>
                </article>

                <article class="product-card" data-modal
                    data-img="IMG/Madera_Roja_Machimbre.jpeg"
                    data-badge="Tablillas PVC"
                    data-category="Láminas de Techo"
                    data-title="Madera Roja Machimbre"
                    data-desc="Lámina PVC machimbre color rojo madera, 25 cm x 5.95 m. Para espacios con estilo y personalidad."
                    data-features="Medidas 25 cm x 5.95 m|Textura machimbre distintiva|Resistente al sol y al agua"
                    data-wa="Hola,%20quiero%20cotizar%20Madera%20Roja%20Machimbre">
                    <div class="product-card-top">
                        <span class="product-type">Roja Machimbre</span>
                        <img src="IMG/Madera_Roja_Machimbre.jpeg" alt="Lámina PVC Madera Roja Machimbre" class="product-image" loading="lazy">
                    </div>
                    <div class="product-card-body">
                        <h3>Madera Roja Machimbre</h3>
                        <p>Lámina PVC 25 cm x 5.95 m con un acabado rojo madera elegante.</p>
                        <button class="button button-secondary open-modal-btn">Ver detalles →</button>
                    </div>
                </article>
            </div>
        </div>

        <!-- Accesorios OSDA -->
        <div class="catalog-group">
            <h3 class="catalog-group-title">
                <span class="catalog-group-icon">🔩</span> Accesorios OSDA
            </h3>
            <div class="products">
                <article class="product-card" data-modal
                    data-img="IMG/Perfiles Metalicos.jpeg"
                    data-badge="Accesorios OSDA"
                    data-category="Accesorios"
                    data-title="Perfilería Metálica"
                    data-desc="Canal de carga, furring y ángulo metálico para instalación de láminas de PVC. Todo lo necesario para un soporte estructural firme."
                    data-features="Incluye canal de carga, furring y ángulo|Compatible con techos y paredes PVC|Montaje rápido y alineado"
                    data-wa="Hola,%20quiero%20cotizar%20Perfilería%20Metálica">
                    <div class="product-card-top">
                        <span class="product-type">Perfilería</span>
                        <img src="IMG/Perfiles Metalicos.jpeg" alt="Perfilería metálica para PVC" class="product-image" loading="lazy">
                    </div>
                    <div class="product-card-body">
                        <h3>Perfilería Metálica</h3>
                        <p>Canal de carga, furring y ángulo metálico para una instalación PVC estructural y ordenada.</p>
                        <button class="button button-secondary open-modal-btn">Ver detalles →</button>
                    </div>
                </article>

                <article class="product-card product-card--featured" data-modal
                    data-img="IMG/Cornisas.jpeg"
                    data-badge="Accesorios OSDA"
                    data-category="Accesorios"
                    data-title="Cornisas PVC"
                    data-desc="Cornisas de PVC para acabados decorativos en remates de muros y techos. Aporta elegancia y protección contra filtraciones."
                    data-features="Acabados decorativos para techos y paredes|Protege remates y esquinas|Material resistente al agua y UV"
                    data-wa="Hola,%20quiero%20cotizar%20Cornisas%20PVC">
                    <div class="product-card-top">
                        <span class="product-type">Cornisas</span>
                        <img src="IMG/Cornisas.jpeg" alt="Cornisas PVC" class="product-image" loading="lazy">
                    </div>
                    <div class="product-card-body">
                        <h3>Cornisas PVC</h3>
                        <p>Cornisas y remates que embellecen y protegen bordes en instalaciones PVC.</p>
                        <button class="button button-secondary open-modal-btn">Ver detalles →</button>
                    </div>
                </article>

                <article class="product-card" data-modal
                    data-img="IMG/Tornillos.webp"
                    data-badge="Accesorios OSDA"
                    data-category="Accesorios"
                    data-title="Tornillos para PVC"
                    data-desc="Tornillos diseñados para fijar láminas y perfiles de PVC con máxima sujeción y sin dañar el material."
                    data-features="Fijación segura en PVC|Cabeza especial para instalaciones limpias|Resistente a corrosión y humedad"
                    data-wa="Hola,%20quiero%20cotizar%20Tornillos%20para%20PVC">
                    <div class="product-card-top">
                        <span class="product-type">Tornillos</span>
                        <img src="IMG/Tornillos.webp" alt="Tornillos especializados para PVC" class="product-image" loading="lazy">
                    </div>
                    <div class="product-card-body">
                        <h3>Tornillos para PVC</h3>
                        <p>Tornillos y fijaciones diseñados para asegurar paneles y perfiles de PVC sin deformarlos.</p>
                        <button class="button button-secondary open-modal-btn">Ver detalles →</button>
                    </div>
                </article>
            </div>
        </div>
    </section>

    <!-- SERVICIOS -->
    <section id="servicios" class="services-section">
        <div class="container section">
            <div class="section-header">
                <span class="section-eyebrow">Por qué elegirnos</span>
                <h2 class="section-title">Nuestros Servicios</h2>
                <p class="section-subtitle">Todo lo que necesitas para tu proyecto, en un solo lugar</p>
            </div>
            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon">🏆</div>
                    <h3>Calidad OSDA</h3>
                    <p>Láminas de PVC con acabado resistente y certificado para techos y paredes de larga duración.</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">⚙️</div>
                    <h3>Instalación segura</h3>
                    <p>Soporte técnico especializado para asegurar un montaje correcto, sin filtraciones ni problemas.</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">📋</div>
                    <h3>Adaptado a tu proyecto</h3>
                    <p>Asesoría personalizada para elegir láminas y accesorios según techo, pared y presupuesto.</p>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">💰</div>
                    <h3>Precios competitivos</h3>
                    <p>Los mejores precios del mercado hondureño sin sacrificar la calidad de los materiales.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CONTACTO -->
    <section id="contacto" class="container section contact-section">
        <div class="contact-info">
            <span class="section-eyebrow">Estamos para ayudarte</span>
            <h2>Contáctanos</h2>
            <p>¿Tienes dudas sobre productos, instalación o tiempos de entrega? Nuestro equipo está listo para darte una solución rápida y personalizada.</p>
            <div class="contact-details">
                <a href="tel:+50494078458" class="contact-detail-item">
                    <span class="contact-detail-icon">📞</span>
                    <div>
                        <strong>Teléfono</strong>
                        <span>+504 9407-8458</span>
                    </div>
                </a>
                <a href="mailto:PVC+Solutionshn@spdt.store" class="contact-detail-item">
                    <span class="contact-detail-icon">✉️</span>
                    <div>
                        <strong>Correo</strong>
                        <span>PVC+Solutionshn@spdt.store</span>
                    </div>
                </a>
                <a href="https://maps.app.goo.gl/zF1D1aYVB2L5DvAF7" target="_blank" rel="noopener noreferrer" class="contact-detail-item">
                    <span class="contact-detail-icon">📍</span>
                    <div>
                        <strong>Dirección</strong>
                        <span>Residencial Costa de Sol Etapa IV, Honduras</span>
                    </div>
                </a>
            </div>
        </div>
        <div class="contact-form-wrapper">
            <form id="formulario-whatsapp" class="contact-form" novalidate>
                <h3>Envíanos un mensaje</h3>
                <div class="form-group">
                    <label for="name">Nombre completo</label>
                    <input type="text" id="name" name="name" required minlength="3" placeholder="Tu nombre completo...">
                    <span class="field-error" id="name-error"></span>
                </div>
                <div class="form-group">
                    <label for="email">Correo electrónico</label>
                    <input type="email" id="email" name="email" required placeholder="tu@correo.com">
                    <span class="field-error" id="email-error"></span>
                </div>
                <div class="form-group">
                    <label for="message">Mensaje</label>
                    <textarea id="message" name="message" rows="4" required minlength="10" placeholder="¿En qué podemos ayudarte?"></textarea>
                    <span class="field-error" id="message-error"></span>
                </div>
                <button type="submit" class="button button-whatsapp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.857L.057 23.943l6.224-1.463A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.7.87.934-3.607-.235-.371A9.818 9.818 0 1112 21.818z"/>
                    </svg>
                    Enviar por WhatsApp
                </button>
            </form>
        </div>
    </section>
`;
