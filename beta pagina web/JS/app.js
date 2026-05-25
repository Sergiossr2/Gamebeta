/**
 * PVC Solutions HN - App.js
 * Enrutador SPA, tema, menú, animaciones, formulario y modal de productos.
 */

const RUTA_INICIAL = 'inicio';

function crearUrlInterna(pagina = RUTA_INICIAL, seccion = '') {
    const params = new URLSearchParams();
    params.set('pagina', pagina || RUTA_INICIAL);
    if (seccion) params.set('seccion', seccion);
    return `${window.location.pathname}?${params.toString()}`;
}

function leerRutaActual() {
    const params = new URLSearchParams(window.location.search);
    return {
        pagina: params.get('pagina') || RUTA_INICIAL,
        seccion: params.get('seccion') || ''
    };
}

function inicializarUI() {
    const themeToggle = document.getElementById('theme-toggle');
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('theme', next);
        });
        applyTheme(localStorage.getItem('theme') || 'light');
    }

    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('active');
            menuToggle.textContent = isOpen ? '✕' : '☰';
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
        document.querySelectorAll('#nav a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.textContent = '☰';
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const mainHeader = document.getElementById('main-header');
    if (mainHeader) {
        window.addEventListener('scroll', () => {
            mainHeader.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    }
}

function cargarVista() {
    const contenedor = document.getElementById('app-content');
    const { pagina, seccion } = leerRutaActual();

    if (vistas[pagina]) {
        contenedor.innerHTML = vistas[pagina];
    } else {
        contenedor.innerHTML = '<div class="container section text-center"><h2>Página no encontrada</h2><p>Revisa el enlace o vuelve al inicio.</p></div>';
    }

    setTimeout(() => {
        if (seccion) {
            const elemento = document.getElementById(seccion);
            if (elemento) {
                window.scrollTo({
                    top: elemento.getBoundingClientRect().top + window.scrollY - 80,
                    behavior: 'smooth'
                });
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
        reinicializarJavascript();
    }, 100);
}

function reinicializarJavascript() {
    if (typeof initCotizador === 'function') {
        initCotizador();
    }

    /* ── Animaciones reveal ── */
    const revealEls = document.querySelectorAll('.product-card, .feature-item, .stat-item, .hero-card-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    revealEls.forEach(el => { el.classList.add('reveal'); observer.observe(el); });

    /* ── Contadores stats ── */
    const stats = document.querySelectorAll('.stat-number[data-target]');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = parseInt(entry.target.getAttribute('data-target'), 10);
                const suffix = entry.target.getAttribute('data-suffix') || '';
                if (Number.isNaN(target)) return;
                let count = 0;
                const updateCount = () => {
                    const speed = Math.max(target / 100, 1);
                    if (count < target) {
                        count = Math.min(count + speed, target);
                        entry.target.innerText = `${Math.ceil(count)}${suffix}`;
                        setTimeout(updateCount, 20);
                    } else {
                        entry.target.innerText = `${target}${suffix}`;
                        entry.target.classList.add('counted');
                    }
                };
                updateCount();
            }
        });
    }, { threshold: 0.5 });
    stats.forEach(stat => statsObserver.observe(stat));

    /* ── Formulario WhatsApp ── */
    const formWhatsApp = document.getElementById('formulario-whatsapp');
    if (formWhatsApp) {
        formWhatsApp.addEventListener('submit', (e) => {
            e.preventDefault();
            const campos = [
                { id: 'name',    mensaje: 'Escribe tu nombre completo.' },
                { id: 'email',   mensaje: 'Escribe un correo válido.' },
                { id: 'message', mensaje: 'Escribe un mensaje de al menos 10 caracteres.' }
            ];
            let valido = true;
            campos.forEach(({ id, mensaje }) => {
                const campo = document.getElementById(id);
                const error = document.getElementById(`${id}-error`);
                const campoValido = campo.checkValidity();
                campo.classList.toggle('input-error', !campoValido);
                if (error) error.textContent = campoValido ? '' : mensaje;
                if (!campoValido) valido = false;
            });
            if (!valido) return;
            const nombre = document.getElementById('name').value.trim();
            const email  = document.getElementById('email').value.trim();
            const msj    = document.getElementById('message').value.trim();
            const texto  = `Hola, soy ${nombre}. Mi correo es ${email}. ${msj}`;
            window.open(`https://wa.me/50494078458?text=${encodeURIComponent(texto)}`, '_blank');
        });
    }

    /* ── Modal de productos ── */
    const modal      = document.getElementById('product-modal');
    const modalClose = document.getElementById('modal-close');

    if (!modal) return;

    function abrirModal(card) {
        document.getElementById('modal-img').src        = card.dataset.img || '';
        document.getElementById('modal-img').alt        = card.dataset.title || '';
        document.getElementById('modal-badge').textContent    = card.dataset.badge || '';
        document.getElementById('modal-category').textContent = card.dataset.category || '';
        document.getElementById('modal-title').textContent    = card.dataset.title || '';
        document.getElementById('modal-desc').textContent     = card.dataset.desc || '';

        const featuresList = document.getElementById('modal-features');
        featuresList.innerHTML = '';
        const features = (card.dataset.features || '').split('|').filter(Boolean);
        features.forEach(f => {
            const li = document.createElement('li');
            li.textContent = f.trim();
            featuresList.appendChild(li);
        });

        const waText = card.dataset.wa || 'Hola,%20quiero%20información';
        document.getElementById('modal-cta').href = `https://wa.me/50494078458?text=${waText}`;

        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        modalClose.focus();
    }

    function cerrarModal() {
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    // Abrir con botón o clic en la card
    document.querySelectorAll('[data-modal]').forEach(card => {
        card.querySelector('.open-modal-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirModal(card);
        });
    });

    // Cerrar con botón ✕
    modalClose?.addEventListener('click', cerrarModal);

    // Cerrar al hacer clic en el overlay (fuera del box)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function onKeydown(e) {
        if (e.key === 'Escape' && !modal.hidden) {
            cerrarModal();
            document.removeEventListener('keydown', onKeydown);
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    inicializarUI();
    cargarVista();
});

window.addEventListener('popstate', cargarVista);

document.addEventListener('click', e => {
    const enlace = e.target.closest('a[href^="?pagina="]');
    if (!enlace) return;
    e.preventDefault();
    const href = enlace.getAttribute('href');
    try {
        window.history.pushState({}, '', href);
    } catch (error) {
        window.location.href = href;
        return;
    }
    cargarVista();
});
