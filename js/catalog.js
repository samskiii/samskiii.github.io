import { products } from './data.js';
import { translations } from './translations.js';

let currentProducts = [...products];
let currentLang = localStorage.getItem('bacho_lang') || 'es';
const grid = document.getElementById('product-grid');
const loadingSpinner = document.getElementById('loading-spinner');

function getCategoryTranslation(category) {
    return translations[currentLang]['category_' + category] || category;
}

function parseSize(sizeStr) {
    if (!sizeStr || typeof sizeStr !== 'string') return 0;
    const dimensions = sizeStr.replace(',', '.').split('*').map(Number);
    if (dimensions.some(isNaN)) return 0;
    return dimensions.reduce((acc, val) => acc * val, 1);
}

function renderProducts() {
    if (!grid) return;
    
    grid.innerHTML = '';

    if (currentProducts.length === 0) {
        grid.innerHTML = `<p class=\"col-span-full text-center text-zinc-400\">No products found.</p>`;
        return;
    }

    const productCards = currentProducts.map(product => {
        const price = Math.ceil(product.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
        const productName = product['name_' + currentLang] || product.name_en;
        return `
            <a href="product.html?id=${product.id}" class="bg-zinc-800 rounded-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300">
                <div class="h-64 bg-gradient-to-t from-zinc-100 to-zinc-200 flex items-center justify-center">
                    <img id="main-product-image" src="${product.images[0]}" alt="${productName}" class="w-full h-full object-contain">
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-semibold mb-1 truncate">${productName}</h3>
                    <p class="text-sm text-zinc-400 mb-3">${getCategoryTranslation(product.category)}</p>
                    <div class="flex justify-between items-center">
                         <span class="text-md font-bold text-green-400">${price}</span>
                         <span class="text-xs font-medium text-white flex items-center group-hover:text-green-400">
                            <span data-translate-key="view_product">${translations[currentLang].view_product}</span>
                            <i data-lucide="arrow-right" class="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1"></i>
                        </span>
                    </div>
                </div>
            </a>
        `;
    }).join('');

    grid.innerHTML = productCards;
    lucide.createIcons();
}

function filterAndSortProducts() {
    const categoryFilter = document.getElementById('category-filter').value;
    const sortBy = document.getElementById('sort-by').value;

    let filtered = [...products];

    if (categoryFilter !== 'all') {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    switch (sortBy) {
        case 'price_asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'size_asc':
            filtered.sort((a, b) => parseSize(a.size) - parseSize(b.size));
            break;
        case 'size_desc':
            filtered.sort((a, b) => parseSize(b.size) - parseSize(a.size));
            break;
    }

    currentProducts = filtered;
    renderProducts();
}

function setupControls() {
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    
    if(!categoryFilter || !sortBy) return;

    const categories = [...new Set(products.map(p => p.category))];
    
    categoryFilter.innerHTML = `<option value="all">${translations[currentLang].filter_all_categories}</option>` +
        categories.map(cat => `<option value="${cat}">${getCategoryTranslation(cat)}</option>`).join('');

    sortBy.innerHTML = `
        <option value="default">${translations[currentLang].sort_default}</option>
        <option value="price_asc">${translations[currentLang].sort_price_asc}</option>
        <option value="price_desc">${translations[currentLang].sort_price_desc}</option>
        <option value="size_asc">${translations[currentLang].sort_size_asc}</option>
        <option value="size_desc">${translations[currentLang].sort_size_desc}</option>
    `;

    categoryFilter.addEventListener('change', filterAndSortProducts);
    sortBy.addEventListener('change', filterAndSortProducts);
}

document.addEventListener('DOMContentLoaded', () => {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    setupControls();
    renderProducts();


    document.body.addEventListener('lang_change', (e) => {
        currentLang = e.detail.lang;
        setupControls();
        filterAndSortProducts();
    });
});
