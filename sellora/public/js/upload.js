document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('upload-form');
  if (!form) return;

  const spinner = document.getElementById('upload-loading-indicator');
  const spinnerText = document.getElementById('upload-spinner-text');
  const errorBox = document.getElementById('upload-error-box');
  const errorList = document.getElementById('upload-error-list');
  const submitBtn = document.getElementById('upload-submit-btn');

  const showSpinner = (text) => {
    if (spinnerText && text) spinnerText.textContent = text;
    if (spinner) spinner.style.display = 'block';
    if (submitBtn) submitBtn.disabled = true;
  };

  const hideSpinner = () => {
    if (spinner) spinner.style.display = 'none';
    if (submitBtn) submitBtn.disabled = false;
  };

  const showErrors = (errors) => {
    if (!errorBox || !errorList) return;

    errorList.innerHTML = '';
    (errors || []).forEach((msg) => {
      const li = document.createElement('li');
      li.textContent = msg;
      errorList.appendChild(li);
    });

    errorBox.style.display = 'block';
  };

  const hideErrors = () => {
    if (!errorBox) return;
    errorBox.style.display = 'none';
    if (errorList) errorList.innerHTML = '';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    hideErrors();
    showSpinner('Subiendo producto...');

    try {
      const formData = new FormData(form);

      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data && data.success) {
        window.location.href = data.redirectUrl || '/';
        return;
      }

      if (data && Array.isArray(data.errors)) {
        showErrors(data.errors);
      } else {
        showErrors(['Error del servidor al subir el producto.']);
      }

    } catch (err) {
      showErrors(['Error de conexión con el servidor.']);
    } finally {
      hideSpinner();
    }
  });
});
