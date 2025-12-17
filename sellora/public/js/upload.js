document.addEventListener('DOMContentLoaded', () => {
  // Works for both upload and edit forms
  const form = document.getElementById('upload-form') || document.getElementById('edit-product-form');
  if (!form) return;
  
  const spinner = document.getElementById('upload-loading-indicator') || document.getElementById('edit-loading-indicator');
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorList = document.getElementById('error-modal-list') || document.getElementById('errorList');
  const errorModalEl = document.getElementById('errorModal');
  const errorModal = errorModalEl ? new bootstrap.Modal(errorModalEl) : null;

  // Get form fields
  const titleInput = form.querySelector('input[name="title"]');
  const descriptionInput = form.querySelector('textarea[name="text"]');
  const categorySelect = form.querySelector('select[name="category"]');
  const priceInput = form.querySelector('input[name="price"]');

  // Error message containers
  const errTitle = document.getElementById('error-title');
  const errDescription = document.getElementById('error-description');
  const errCategory = document.getElementById('error-category');
  const errPrice = document.getElementById('error-price');
  const errFile = document.getElementById('error-file');

  const fileInput = document.getElementById('file-input');
  const previewImage = document.getElementById('preview-image');
  let _currentObjectUrl = null;

  // Default images paths 
  const PLACEHOLDERS = ['/img/imagen_2025-10-14_183044131.png', '/img/placeholder.png'];

  if (fileInput && previewImage) {
    const removeBtn = document.getElementById('remove-image-btn');
    const updateRemoveBtn = (visible) => {
      if (!removeBtn) return;
      removeBtn.style.display = visible ? 'inline-flex' : 'none';
    };

    const currentSrc = previewImage.getAttribute('src');
    if (currentSrc && !PLACEHOLDERS.some(p => currentSrc.includes(p))) {
        updateRemoveBtn(true);
    }

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (file) {
        if (!file.type || !file.type.startsWith('image/')) {
          previewImage.src = '/img/imagen_2025-10-14_183044131.png';
          updateRemoveBtn(false);
          return;
        }
        if (_currentObjectUrl) URL.revokeObjectURL(_currentObjectUrl);
        _currentObjectUrl = URL.createObjectURL(file);
        previewImage.src = _currentObjectUrl;
        updateRemoveBtn(true);
      } else {
        if (_currentObjectUrl) {
          URL.revokeObjectURL(_currentObjectUrl);
          _currentObjectUrl = null;
        }
        previewImage.src = '/img/imagen_2025-10-14_183044131.png';
        updateRemoveBtn(false);
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (_currentObjectUrl) {
          URL.revokeObjectURL(_currentObjectUrl);
          _currentObjectUrl = null;
        }
        fileInput.value = '';
        previewImage.src = '/img/imagen_2025-10-14_183044131.png';
        updateRemoveBtn(false);
      });
    }
  }

  const showSpinner = () => {
    if(spinner) spinner.style.display = 'block';
    if(submitBtn) submitBtn.disabled = true;
  };

  const hideSpinner = () => {
    if(spinner) spinner.style.display = 'none';
    if(submitBtn) submitBtn.disabled = false;
  };

  // Clear all error messages
  const clearFieldErrors = () => {
    [errTitle, errDescription, errCategory, errPrice, errFile].filter(el => el).forEach(el => el.textContent = '');
    [titleInput, descriptionInput, categorySelect, priceInput, fileInput].filter(el => el).forEach(el => el.classList.remove('is-invalid'));
    if (errorList) errorList.innerHTML = '';
  };

  // Get validation error message
  const getValidationMessage = (fld) => {
    if (!fld) return 'Invalid value';
    const v = fld.validity;
    if (v.valueMissing) return (fld === titleInput) ? 'Please enter a product name.' : (fld === descriptionInput) ? 'Please enter a description.' : (fld === fileInput) ? 'Please choose an image file.' : 'This field is required.';
    if (v.tooShort) return `Please lengthen this text to ${fld.minLength} characters or more.`;
    if (v.tooLong) return `Please shorten this text to no more than ${fld.maxLength} characters.`;
    if (v.typeMismatch) return 'Please enter a value of the correct type.';
    if (v.rangeUnderflow) return `Value must be at least ${fld.min}.`;
    if (v.rangeOverflow) return `Value must be no more than ${fld.max}.`;
    if (v.stepMismatch) return 'Please enter a valid value.';
    if (v.patternMismatch) return 'Please match the requested format.';
    // Check if title starts with capital letter
    if (fld === titleInput && fld.value && fld.value.trim()) {
      const firstChar = fld.value.trim()[0];
      if (firstChar !== firstChar.toUpperCase() || firstChar.toLowerCase() === firstChar) {
        return 'Title must start with a capital letter.';
      }
    }
    return 'Invalid value';
  };

  // Show error messages
  const displayFieldErrors = (errors) => {
    if (!errors) return;
    if (typeof errors === 'object' && !Array.isArray(errors)) {
      Object.keys(errors).forEach(k => {
        const val = errors[k];
        const msg = Array.isArray(val) ? val.join(', ') : String(val);
        switch (k.toLowerCase()) {
          case 'title': if (errTitle) { errTitle.textContent = msg; titleInput && titleInput.classList.add('is-invalid'); } break;
          case 'text': case 'description': if (errDescription) { errDescription.textContent = msg; descriptionInput && descriptionInput.classList.add('is-invalid'); } break;
          case 'category': if (errCategory) { errCategory.textContent = msg; categorySelect && categorySelect.classList.add('is-invalid'); } break;
          case 'price': if (errPrice) { errPrice.textContent = msg; priceInput && priceInput.classList.add('is-invalid'); } break;
          case 'file': if (errFile) { errFile.textContent = msg; fileInput && fileInput.classList.add('is-invalid'); } break;
          default:
            if (errorList) {
              const li = document.createElement('li'); li.textContent = msg; errorList.appendChild(li);
            }
        }
      });
      return;
    }

    const arr = Array.isArray(errors) ? errors : [errors];
    arr.forEach(message => {
      const m = String(message).toLowerCase();
      if (m.includes('title') || m.includes('product name')) {
        if (errTitle) { errTitle.textContent = message; titleInput && titleInput.classList.add('is-invalid'); return; }
      }
      if (m.includes('length') || m.includes('description') || m.includes('min')) {
        if (errDescription) { errDescription.textContent = message; descriptionInput && descriptionInput.classList.add('is-invalid'); return; }
      }
      if (m.includes('category')) { if (errCategory) { errCategory.textContent = message; categorySelect && categorySelect.classList.add('is-invalid'); return; } }
      if (m.includes('price')) { if (errPrice) { errPrice.textContent = message; priceInput && priceInput.classList.add('is-invalid'); return; } }
      if (m.includes('file') || m.includes('image')) { if (errFile) { errFile.textContent = message; fileInput && fileInput.classList.add('is-invalid'); return; } }

      if (errorList) {
        const li = document.createElement('li'); li.textContent = message; errorList.appendChild(li);
      }
    });
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors();

    // Check all fields before submitting
    const fieldsToCheck = [titleInput, descriptionInput, categorySelect, priceInput, fileInput];
    let ok = true;
    for (const fld of fieldsToCheck) {
      if (!fld) continue;
      
      // Check if title starts with capital
      if (fld === titleInput && fld.value && fld.value.trim()) {
        const firstChar = fld.value.trim()[0];
        if (firstChar !== firstChar.toUpperCase() || firstChar.toLowerCase() === firstChar) {
          ok = false;
          if (errTitle) {
            errTitle.textContent = 'Title must start with a capital letter.';
            fld.classList.add('is-invalid');
          }
          continue;
        }
      }
      
      if (!fld.checkValidity()) {
        ok = false;
        const vm = getValidationMessage(fld) || 'Invalid value';
        if (fld === titleInput && errTitle) { errTitle.textContent = vm; fld.classList.add('is-invalid'); }
        else if (fld === descriptionInput && errDescription) { errDescription.textContent = vm; fld.classList.add('is-invalid'); }
        else if (fld === categorySelect && errCategory) { errCategory.textContent = vm; fld.classList.add('is-invalid'); }
        else if (fld === priceInput && errPrice) { errPrice.textContent = vm; fld.classList.add('is-invalid'); }
        else if (fld === fileInput && errFile) { errFile.textContent = vm; fld.classList.add('is-invalid'); }
      }
    }
    if (!ok) return;

    showSpinner();

    try {
      const formData = new FormData(form);

      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.location.href = data.redirectUrl || `/product/${data.product._id}`;
        return;
      }

      // Show server errors
      if (data && data.errors) {
        displayFieldErrors(data.errors);
      } else {
        displayFieldErrors(['Server Error']);
      }
      // Show error modal if needed
      if (errorList && errorList.children.length > 0 && errorModal) errorModal.show();

    } catch (err) {
      displayFieldErrors(['Cannot connect to server']);
      if (errorModal) errorModal.show();
    } finally {
      hideSpinner();
    }
  });
});