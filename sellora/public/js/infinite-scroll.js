document.addEventListener('DOMContentLoaded', function() {

     function showSpinner() {
    const spinner = document.getElementById('loading-indicator');
    if (spinner) spinner.style.display = 'block';
  }

  function hideSpinner() {
    const spinner = document.getElementById('loading-indicator');
    if (spinner) spinner.style.display = 'none';
  }

  let page = window.selloraData?.currentPage || 1;
  let loading = false;
  let hasMore = window.selloraData?.hasMore ?? true;
  

  const container = document.getElementById('products-container');
  const loadingIndicator = document.getElementById('loading-indicator');
  const noMoreMessage = document.getElementById('no-more-products');

  // Fetch products JSON

  async function fetchProducts(page) {
    const params = new URLSearchParams({ page });
    if (window.selloraData?.searchTerm) params.set('q', window.selloraData.searchTerm);
    if (window.selloraData?.category && window.selloraData.category !== 'All')
      params.set('category', window.selloraData.category);

    const response = await fetch('/loadmoreproducts?' + params.toString());
    
    if (!response.ok) {
      hasMore = false;
      if (noMoreMessage) noMoreMessage.style.display = 'block';
      return [];
    }

    const data = await response.json();
    hasMore = data.hasMore;
    return data.products;
  }

  //Render products in DOM

  function renderProducts(products) {
    products.forEach(product => {
      const col = document.createElement('div');
      col.className = "col-12 col-md-6 col-lg-4";
      col.innerHTML = `
        <div class='card h-100 d-flex flex-column'> 
          <img src="${product.image}" class="card-img-top" alt="${product.title}">
          <div class="card-body">
            <h4 class="card-title">${product.title}</h4>
            <p class="card-text">${product.text}</p>
            <p>${product.price}</p>
            <button class="btn btn-custom me-2" onclick="window.location.href='/product/${product._id}'">View more</button>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  }

  //Load next page 
  async function loadNextPage() {
    if (loading || !hasMore) return;

    loading = true;
    page++;

    showSpinner();


    const products = await fetchProducts(page);
    if (products.length > 0) renderProducts(products);

    if (!hasMore && noMoreMessage) noMoreMessage.style.display = 'block';

    loading = false;
    hideSpinner();
  }

  function checkScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
      loadNextPage();
    }
  }
  window.addEventListener('scroll', checkScroll);

});
