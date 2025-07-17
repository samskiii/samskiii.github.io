import { products } from './data.js';
import { translations } from './translations.js';

function getProductById(id) {
    return products.find(p => p.id === id);
}

function renderProduct() {
    let currentLang = localStorage.getItem('bacho_lang') || 'es';
    const container = document.getElementById('product-details-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));

    const product = getProductById(productId);
    
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }

    if (!product) {
        container.innerHTML = `<div class=\"container mx-auto px-6 text-center\"><p>Product not found.</p></div>`;
        return;
    }

    const productName = product['name_' + currentLang] || product.name_en;
    const productDescription = product['description_' + currentLang] || product.description_en || "No description available for this product.";

    document.title = (translations[currentLang]?.product_title || 'Bacho - {productName}').replace('{productName}', productName);
    
    const category = translations[currentLang]['category_' + product.category] || product.category;
    const price = Math.ceil(product.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

    let imageGalleryHtml = '';
    if (product.images && product.images.length > 0) {
        imageGalleryHtml = `
            <div>
                <div class="bg-zinc-800 rounded-lg aspect-square w-full mb-4 overflow-hidden">
                    <img id="main-product-image" src="${product.images[0]}" alt="${productName}" class="w-full h-full object-contain">
                </div>
                <div id="thumbnail-gallery" class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    ${product.images.map((imgSrc, index) => `
                        <div class="thumbnail-image-wrapper rounded-lg aspect-square w-full overflow-hidden cursor-pointer ${index === 0 ? 'ring-2 ring-green-500' : 'ring-2 ring-transparent hover:ring-zinc-500'} transition-all duration-200">
                            <img src="${imgSrc}" alt="Thumbnail ${index + 1}" class="w-full h-full object-cover">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        const fallbackText = translations[currentLang]?.image_not_available || 'Image not available';
        imageGalleryHtml = `
            <div>
                <div class="bg-zinc-800 rounded-lg aspect-square w-full flex items-center justify-center">
                    <span class="text-zinc-500 p-4 text-center">${fallbackText}</span>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
    <div class="container mx-auto px-6">
        <div class="grid md:grid-cols-2 gap-12 items-start">
            ${imageGalleryHtml}

            <!-- Product Info -->
            <div>
                <a href="catalog.html" class="text-sm text-green-400 hover:text-green-300 mb-2 inline-block">&larr; <span data-translate-key="nav_catalog">${translations[currentLang].nav_catalog}</span></a>
                <h1 class="text-4xl md:text-5xl font-bold mb-4">${productName}</h1>
                <p class="text-zinc-400 mb-4"><strong class="text-zinc-200" data-translate-key="product_category">${translations[currentLang].product_category}</strong>: ${category}</p>
                
                <div class="text-3xl font-bold text-green-400 mb-6">
                    <span class="text-base font-normal text-zinc-400" data-translate-key="product_price_from">${translations[currentLang].product_price_from}</span> ${price}
                </div>

                <div class="prose prose-invert max-w-none mb-8">
                    <h3 data-translate-key="product_description">${translations[currentLang].product_description}</h3>
                    <p>${productDescription}</p>
                    ${product.size ? `<p><strong data-translate-key="product_size">${translations[currentLang].product_size}</strong>: ${product.size}</p>` : ''}
                </div>

                <!-- Consultation Form -->
                <div class="bg-zinc-800 p-6 rounded-lg">
                    <h3 class="text-xl font-bold mb-2" data-translate-key="product_consult_title">${translations[currentLang].product_consult_title}</h3>
                    <p class="text-zinc-400 text-sm mb-4" data-translate-key="product_consult_subtitle">${translations[currentLang].product_consult_subtitle}</p>
                    <form id="product-consult-form" class="space-y-4">
                        <div>
                            <label for="name" class="sr-only" data-translate-key="form_name">${translations[currentLang].form_name}</label>
                            <input type="text" id="name" name="name" placeholder="${translations[currentLang].form_name}" class="w-full bg-zinc-700 border border-zinc-600 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500 placeholder-zinc-400">
                        </div>
                        <div>
                            <label for="email" class="sr-only" data-translate-key="form_email">${translations[currentLang].form_email}</label>
                            <input type="email" id="email" name="email" placeholder="${translations[currentLang].form_email}" class="w-full bg-zinc-700 border border-zinc-600 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500 placeholder-zinc-400">
                        </div>
                        <div>
                            <label for="phone" class="sr-only" data-translate-key="form_phone">${translations[currentLang].form_phone}</label>
                            <input type="tel" id="phone" name="phone" placeholder="${translations[currentLang].form_phone} (Optional)" class="w-full bg-zinc-700 border border-zinc-600 rounded-md py-2 px-3 focus:ring-green-500 focus:border-green-500 placeholder-zinc-400">
                        </div>
                        <button type="submit" class="w-full bg-green-600 hover:bg-green-500 transition-colors duration-300 text-white font-semibold py-3 px-8 rounded-lg" data-translate-key="form_submit_consult">${translations[currentLang].form_submit_consult}</button>
                        <p id="form-feedback" class="text-sm text-center mt-4"></p>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `;

    if (product.images && product.images.length > 0) {
        const mainImage = document.getElementById('main-product-image');
        const thumbnailWrappers = document.querySelectorAll('.thumbnail-image-wrapper');
        
        thumbnailWrappers.forEach((wrapper) => {
            wrapper.addEventListener('click', () => {
                const newSrc = wrapper.querySelector('img').src;
                if (mainImage.src !== newSrc) {
                    mainImage.src = newSrc;
                }
                
                thumbnailWrappers.forEach(w => {
                    w.classList.remove('ring-green-500');
                    w.classList.add('ring-transparent', 'hover:ring-zinc-500');
                });
                wrapper.classList.remove('ring-transparent', 'hover:ring-zinc-500');
                wrapper.classList.add('ring-green-500');
            });
        });
    }

    handleFormSubmission('product-consult-form', 'form_success_message_product');
}

function handleFormSubmission(formId, feedbackMessageKey) {
    let currentLang = localStorage.getItem('bacho_lang') || 'es';
    const form = document.getElementById(formId);
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const feedbackEl = document.getElementById('form-feedback');
            if(feedbackEl) {
                feedbackEl.textContent = translations[currentLang][feedbackMessageKey];
                feedbackEl.classList.add('text-green-400');
                form.reset();
                setTimeout(() => {
                    feedbackEl.textContent = '';
                    feedbackEl.classList.remove('text-green-400');
                }, 5000);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderProduct();

    document.body.addEventListener('lang_change', (e) => {
        renderProduct();
    });
});
