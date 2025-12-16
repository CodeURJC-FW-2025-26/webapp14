document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('upload-form');
  const spinner = document.getElementById('upload-loading-indicator');
  const submitBtn = document.getElementById('upload-submit-btn');
  const errorList = document.getElementById('error-modal-list');
  const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));

  const showSpinner = () => {
    spinner.style.display = 'block';
    submitBtn.disabled = true;
  };

  const hideSpinner = () => {
    spinner.style.display = 'none';
    submitBtn.disabled = false;
  };

  const showErrors = (errors) => {
    errorList.innerHTML = '';
    errors.forEach(e => {
      const li = document.createElement('li');
      li.textContent = e;
      errorList.appendChild(li);
    });
    errorModal.show();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
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
        window.location.href = data.redirectUrl;
        return;
      }

      showErrors(data.errors || ['Server Error']);

    } catch {
      showErrors(['Cannot connect to server']);
    } finally {
      hideSpinner();
    }
  });
});
