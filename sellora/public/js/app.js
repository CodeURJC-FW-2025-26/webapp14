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

  // Only run infinite scroll if we're on the main page
  if (!container) return;

  // Fetch products JSON

  if (container) {
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
                <p>${product.price}€</p>
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
  }
});

// Defined outsiede DOMContentLoaded to be globally accessible
window.deleteProduct = async function(productId) {
    //Confirmation
    if (!confirm("Are you sure you want to delete this product?")) return;

    //Spinner
    const spinner = document.getElementById('delete-spinner');
    if (spinner) spinner.style.display = 'flex';

    try {
        //AJAX petition
        const response = await fetch(`/product/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            window.location.href = '/';
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Server Error');
        }

    } catch (error) {
        if (spinner) spinner.style.display = 'none';
        alert("Error deleting product: " + error.message);
    }
};




window.submitReview = async function(event, productId) {
    event.preventDefault();

    const form = document.getElementById('review-form');
    const authorInput = document.getElementById('review-author');
    const textInput = document.getElementById('review-text');
    const ratingInput = document.getElementById('review-rating');

    // Validation
    let isValid = true;
    [authorInput, textInput, ratingInput].forEach(input => input.classList.remove('is-invalid'));

    if (!authorInput.value.trim()) { authorInput.classList.add('is-invalid'); isValid = false; }
    if (!textInput.value.trim()) { textInput.classList.add('is-invalid'); isValid = false; }
    if (!ratingInput.value) { ratingInput.classList.add('is-invalid'); isValid = false; }

    if (!isValid) return;

    // Spinner
    const spinner = document.getElementById('loading-indicator');
    if (spinner) spinner.style.display = 'block';

    const formData = new URLSearchParams();
    formData.append('author', authorInput.value.trim());
    formData.append('text', textInput.value.trim());
    formData.append('rating', ratingInput.value);

    try {
        const response = await fetch(`/product/${productId}/reviews`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
            form.reset();
            
            const newReviewHTML = `
                <div class="review-card" 
                     id="review-${data.review._id}"
                     data-author="${data.review.author}"
                     data-text="${data.review.text}"
                     data-rating="${data.review.rating}">
                     
                  <div class="review-view">
                      <div class="review-header">
                        <div class="review-author">${data.review.author}</div>
                      </div>
                      <div class="review-content">“${data.review.text}”</div>
                      <div class="review-rating">${data.review.rating}</div>
                      <div class="review-actions">
                        
                        <button onclick="editReview('${data.review._id}')" class="btn btn-custom me-2">Edit</button>
                        
                        <button class="btn btn-custom me-2 btn-delete-review" 
                                data-product-id="${productId}" 
                                data-review-id="${data.review._id}">
                            Delete
                        </button>

                      </div>
                  </div>
                </div>
            `;

            const container = document.getElementById('reviews-container');
            container.insertAdjacentHTML('beforeend', newReviewHTML);

        } else {
            throw new Error(data.message || 'Error posting review');
        }

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    
    // DOM references
    const dialog = document.getElementById('error-dialog');
    const errorMsg = document.getElementById('error-message');
    const closeBtn = document.getElementById('btn-close-error');
    const loader = document.getElementById('loading-indicator');

    closeBtn.addEventListener('click', () => dialog.close());

    // buttons
    document.querySelectorAll('.btn-borrar').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            // Element ID
            const id = e.target.dataset.id;
            
            // Show feedback
            loader.style.display = 'block';

            try {
                // async AJAX comms
                const response = await fetch('borrar_secundario.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `id=${id}`
                });

                const data = await response.json();

                // hide visual feedback
                loader.style.display = 'none';

                if (data.status === 'success') {
                    // delete item from DOM
                    const itemToRemove = document.getElementById(`elemento-${id}`);
                    if (itemToRemove) {
                        itemToRemove.remove();
                    }
                } else {
                    // server returned an error
                    errorMsg.textContent = data.message || 'Error al borrar';
                    dialog.showModal();
                }

            } catch (error) {
                // AJAX Error 
                loader.style.display = 'none';
                errorMsg.textContent = 'Error de conexión con el servidor';
                dialog.showModal();
            }
        });
    });
});

// Convert review card to edit form.
window.editReview = function(reviewId) {
    const card = document.getElementById(`review-${reviewId}`);
    if (!card) return;

    // Using current values from dataset
    const currentAuthor = card.dataset.author;
    const currentText = card.dataset.text;
    const currentRating = card.dataset.rating;
    
    // Generate from HTML the edit form
    const formHTML = `
        <form class="w-100" novalidate onsubmit="updateReview(event, '${window.productId || getProductIdFromUrl()}', '${reviewId}')">
            <h4 class="mb-3">Edit Review</h4>
            
            <div class="mb-3">
                <input type="text" id="edit-author-${reviewId}" class="form-control" value="${currentAuthor}" required placeholder="Your name">
                <div class="invalid-feedback">Author is required.</div>
            </div>

            <div class="mb-3">
                <input type="text" id="edit-text-${reviewId}" class="form-control" value="${currentText}" required placeholder="Review text">
                <div class="invalid-feedback">Review text is required.</div>
            </div>

            <div class="mb-3">
                <select id="edit-rating-${reviewId}" class="form-select" required>
                    <option value="" disabled>Select rating</option>
                    <option ${currentRating === '⭐⭐⭐⭐⭐' ? 'selected' : ''}>⭐⭐⭐⭐⭐</option>
                    <option ${currentRating === '⭐⭐⭐⭐☆' ? 'selected' : ''}>⭐⭐⭐⭐☆</option>
                    <option ${currentRating === '⭐⭐⭐☆☆' ? 'selected' : ''}>⭐⭐⭐☆☆</option>
                    <option ${currentRating === '⭐⭐☆☆☆' ? 'selected' : ''}>⭐⭐☆☆☆</option>
                    <option ${currentRating === '⭐☆☆☆☆' ? 'selected' : ''}>⭐☆☆☆☆</option>
                </select>
                <div class="invalid-feedback">Rating is required.</div>
            </div>

            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary btn-custom" onclick="cancelEdit('${reviewId}')">Cancel</button>
                <button type="submit" class="btn btn-primary btn-custom">Save</button>
            </div>
        </form>
    `;

    card.innerHTML = formHTML;
};

// Cancel edit and restore view
window.cancelEdit = function(reviewId) {
    const card = document.getElementById(`review-${reviewId}`);
    if (!card) return;

    // Restore view with original data
    renderReviewView(card, {
        author: card.dataset.author,
        text: card.dataset.text,
        rating: card.dataset.rating,
        _id: reviewId
    });
};

// AJAX update
window.updateReview = async function(event, productId, reviewId) {
    event.preventDefault();

    const authorInput = document.getElementById(`edit-author-${reviewId}`);
    const textInput = document.getElementById(`edit-text-${reviewId}`);
    const ratingInput = document.getElementById(`edit-rating-${reviewId}`);

    // Validation
    let isValid = true;
    [authorInput, textInput, ratingInput].forEach(input => input.classList.remove('is-invalid'));

    if (!authorInput.value.trim()) { authorInput.classList.add('is-invalid'); isValid = false; }
    if (!textInput.value.trim()) { textInput.classList.add('is-invalid'); isValid = false; }
    if (!ratingInput.value) { ratingInput.classList.add('is-invalid'); isValid = false; }

    if (!isValid) return;

    // Spinner
    const spinner = document.getElementById('loading-indicator');
    const spinnerText = document.getElementById('spinner-text');
    if (spinner) {
        if (spinnerText) spinnerText.textContent = "Updating...";
        spinner.style.display = 'block';
    }

    const formData = new URLSearchParams();
    formData.append('author', authorInput.value.trim());
    formData.append('text', textInput.value.trim());
    formData.append('rating', ratingInput.value);

    try {
        const response = await fetch(`/product/${productId}/reviews/${reviewId}/edit`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
            const card = document.getElementById(`review-${reviewId}`);
            
            // Update data attributes
            card.dataset.author = data.review.author;
            card.dataset.text = data.review.text;
            card.dataset.rating = data.review.rating;

            // Normal view with new data
            renderReviewView(card, data.review);

        } else {
            throw new Error(data.message || 'Error updating review');
        }

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
};

// Helper for obtaining product ID from URL
function getProductIdFromUrl() {
    const parts = window.location.pathname.split('/');
    const index = parts.indexOf('product');
    return (index !== -1 && parts.length > index + 1) ? parts[index + 1] : null;
}

// Helper for rendering review view
function renderReviewView(container, review) {
    const productId = getProductIdFromUrl(); 
    container.innerHTML = `
        <div class="review-view">
          <div class="review-header">
            <div class="review-author">${review.author}</div>
          </div>
          <div class="review-content">“${review.text}”</div>
          <div class="review-rating">${review.rating}</div>
          <div class="review-actions">
            <button onclick="editReview('${review._id}')" class="btn btn-custom me-2">Edit</button>
            <button class="btn btn-custom me-2 btn-delete-review" data-product-id="${productId}" data-review-id="${review._id}">
            Delete
            </button>
          </div>
        </div>
    `;
}

// AJAX delete review
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader-reviews');

    document.body.addEventListener('click', async function(e) {
        if (e.target.classList.contains('btn-delete-review')) {

            if(!confirm("Are you sure you want to delete this review?")) return;

            const btn = e.target;
            const productId = btn.dataset.productId;
            const reviewId = btn.dataset.reviewId;

            //loader
            if(loader) loader.style.display = 'block';

            try {
                // Ajax request
                const response = await fetch(`/product/${productId}/reviews/${reviewId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                let data;
                try {
                    data = await response.json();
                } catch (err) {
                    throw new Error("Invalid server response");
                }

                // hide loader
                if(loader) loader.style.display = 'none';

                if (response.ok && data.success) {
                    const reviewCard = document.getElementById(`review-${reviewId}`);
                    if (reviewCard) {
                        reviewCard.remove();
                    }
                } else {
                    alert(data.message || 'Error deleting review.');
                }

            } catch (error) {
                if(loader) loader.style.display = 'none';
                console.error(error);
                alert('Connection error. Please try again.');
            }
        }
    });
});

// check product form for edit page
document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('edit-product-form');
    if (!editForm) return;

    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    // Success, get the page
                    const html = await response.text();
                    document.open();
                    document.write(html);
                    document.close();
                }
            } else {
                // Error, get error bootstrap modal
                const data = await response.json();
                if (data.errors && data.errors.length > 0) {
                    const errorList = document.getElementById('errorList');
                    errorList.innerHTML = data.errors.map(err => `<li>${err}</li>`).join('');
                    const modal = new bootstrap.Modal(document.getElementById('errorModal'));
                    modal.show();
                }
            }
        } catch (error) {
            console.error('Error:', error);
            const errorList = document.getElementById('errorList');
            errorList.innerHTML = '<li>An error occurred while updating the product.</li>';
            const modal = new bootstrap.Modal(document.getElementById('errorModal'));
            modal.show();
        }
    });
});