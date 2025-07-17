import { translations } from './translations.js';
import { products } from './data.js';

let currentLang = localStorage.getItem('bacho_lang') || 'es';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('bacho_lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.dataset.translateKey;
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    const esBtn = document.getElementById('lang-es');
    const enBtn = document.getElementById('lang-en');
    if (esBtn && enBtn) {
        if (lang === 'es') {
            esBtn.classList.remove('lang-inactive');
            esBtn.classList.add('lang-active');
            enBtn.classList.remove('lang-active');
            enBtn.classList.add('lang-inactive');
        } else {
            enBtn.classList.remove('lang-inactive');
            enBtn.classList.add('lang-active');
            esBtn.classList.remove('lang-active');
            esBtn.classList.add('lang-inactive');
        }
    }
    
    loadMarkdownContent();
    
    if (document.getElementById('featured-products')) {
        renderFeaturedProducts();
    }

    const event = new CustomEvent('lang_change', { detail: { lang: currentLang } });
    document.body.dispatchEvent(event);
}

async function loadMarkdownContent() {
    const markdownContainer = document.getElementById('markdown-content');
    if (!markdownContainer || typeof marked === 'undefined') return;

    const pageName = window.location.pathname.split('/').pop().replace('.html', '');
    const validPages = ['about', 'faq', 'contact'];

    if (validPages.includes(pageName)) {
        const filePath = `content/${pageName}_${currentLang}.md`;
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error('File not found');
            const markdownText = await response.text();
            markdownContainer.innerHTML = marked.parse(markdownText);
        } catch (error) {
            markdownContainer.innerHTML = `<p>Error: Could not load content.</p>`;
            console.error('Error loading markdown:', error);
        }
    }
}

function handleFormSubmission(formId, feedbackMessageKey) {
    const form = document.getElementById(formId);
    if(form) {
        form.addEventListener('submit', (e) => {            
            const feedbackEl = form.querySelector('p[id$=\"-feedback\"]');
            if(feedbackEl) {
                feedbackEl.textContent = translations[currentLang][feedbackMessageKey];
                feedbackEl.classList.add('text-green-400');
                setTimeout(() => {
                    feedbackEl.textContent = '';
                }, 5000);
            }
        });
    }
}

function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    const featuredIds = [8, 21, 170]; 
    const featured = products.filter(p => featuredIds.includes(p.id));

    container.innerHTML = featured.map(product => {
        const price = Math.ceil(product.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
        const productName = product['name_' + currentLang] || product.name_en;
        return `
            <a href="product.html?id=${product.id}" class="bg-zinc-800 rounded-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300">
                <div class="h-64 bg-zinc-700 flex items-center justify-center">
                    <img id="main-product-image" src="${product.images[0]}" alt="${productName}" class="w-full h-full object-contain">
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-semibold mb-2 truncate">${productName}</h3>
                    <p class="text-zinc-400 mb-4">${translations[currentLang]['category_' + product.category] || product.category}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-lg font-bold text-green-400">${price}</span>
                        <span class="text-sm font-medium text-white flex items-center group-hover:text-green-400">
                            <span data-translate-key="view_product">${translations[currentLang].view_product}</span>
                            <i data-lucide="arrow-right" class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"></i>
                        </span>
                    </div>
                </div>
            </a>
        `;
    }).join('');
    lucide.createIcons();
}

function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if(menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('-translate-y-full');
            const icon = menuBtn.querySelector('i');
            icon.setAttribute('data-lucide', mobileMenu.classList.contains('-translate-y-full') ? 'menu' : 'x');
            lucide.createIcons();
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    document.getElementById('lang-es')?.addEventListener('click', () => setLanguage('es'));
    document.getElementById('lang-en')?.addEventListener('click', () => setLanguage('en'));

    setupMobileMenu();
    setLanguage(currentLang);
    
    if (document.getElementById('contact-form')) {
        handleFormSubmission('contact-form', 'form_success_message_contact');
    }

    document.getElementById('app-container').classList.remove('opacity-0');
});
