import products from './data/products.json';

const PRODUCTS_PER_PAGE = 5;

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

// Turns a category name into a CSS-friendly value, e.g. "Line & Reels" -> "line-reels".
// The stylesheet uses it to give each category badge its own color.
function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Small helper so each card element is one line instead of three.
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

// Builds one product card: image, category badge, name, description and price.
function createProductCard(product) {
  const card = createElement('li', 'product-card');
  card.dataset.category = toSlug(product.category);

  const image = createElement('img', 'product-image');
  image.src = product.imageUrl;
  image.alt = product.name;
  image.width = 800;
  image.height = 800;
  image.decoding = 'async';

  const body = createElement('div', 'product-body');
  body.append(
    createElement('span', 'category-badge', product.category),
    createElement('h2', 'product-name', product.name),
    createElement('p', 'product-description', product.description),
    createElement('p', 'product-price', priceFormatter.format(product.price)),
  );

  card.append(image, body);
  return card;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initStorePage() {
  const grid = document.querySelector('#product-grid');
  const prevButton = document.querySelector('#prev-page');
  const nextButton = document.querySelector('#next-page');
  const pageIndicator = document.querySelector('#page-indicator');

  // Only the Store page has a product grid, so do nothing on the other pages.
  if (!grid || !prevButton || !nextButton || !pageIndicator) {
    return;
  }

  const totalPages = Math.max(
    1,
    Math.ceil(products.length / PRODUCTS_PER_PAGE),
  );
  let currentPage = 1;

  // Shows the 5 products for the current page and updates the controls.
  function renderPage() {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const pageProducts = products.slice(start, start + PRODUCTS_PER_PAGE);

    grid.replaceChildren(...pageProducts.map(createProductCard));

    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
  }

  function goToPage(page, clickedButton) {
    // Clamp so the page can never go below 1 or above the last page.
    currentPage = Math.min(Math.max(page, 1), totalPages);
    renderPage();

    // A disabled button loses keyboard focus, so move focus to the other button.
    if (clickedButton.disabled) {
      const otherButton =
        clickedButton === nextButton ? prevButton : nextButton;
      otherButton.focus();
    }

    // If the top of the grid has scrolled off screen, bring it back into view
    // so the first new product is visible (helpful on phones).
    if (grid.getBoundingClientRect().top < 0) {
      grid.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }

  prevButton.addEventListener('click', () =>
    goToPage(currentPage - 1, prevButton),
  );
  nextButton.addEventListener('click', () =>
    goToPage(currentPage + 1, nextButton),
  );

  renderPage();
}

initStorePage();
