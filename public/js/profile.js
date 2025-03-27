document.addEventListener("DOMContentLoaded", function () {
    const editButton = document.getElementById('editProfileBtn');
    const inputField = document.getElementById('newName');
    const saveBtn = document.getElementById('saveNameBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const nameEditGroup = document.getElementById('nameEditGroup');
    const newNameInput = document.getElementById('newName');

    // Mostrar los botones de Guardar y Cancelar al hacer clic en Cambiar Nombre
    editButton.addEventListener('click', () => {
      editButton.style.display = 'none'; // Oculta el botón Cambiar Nombre
      nameEditGroup.classList.remove('hidden'); // Muestra el grupo de edición
      newNameInput.value = ''; // Limpia el campo de texto
    });

    // Cancelar la edición y ocultar el input
    cancelBtn.addEventListener('click', () => {
      nameEditGroup.classList.add('hidden'); // Oculta el grupo de edición
      editButton.style.display = 'inline-block'; // Muestra el botón Cambiar Nombre
    });

    // Guardar el nombre y actualizar el valor (validación)
    saveBtn.addEventListener('click', async () => {
      const newName = newNameInput.value.trim();

      // Validación: Si el campo está vacío, mostramos una alerta
      if (newName === '') {
        alert('El nombre no puede estar vacío.');
      } else {
        try {
          // Realizamos la petición para actualizar el nombre
          const response = await fetch('/cambiarNombre', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newName })
          });

          const result = await response.json();

          if (response.status === 409) {
            alert("Ese nombre de usuario ya está en uso. Prueba con otro.");
          } else if (response.ok) {
            alert(result.message);
            setTimeout(() => { location.reload(); }, 500); // Recarga la página para reflejar los cambios
          } else {
            alert("Error: " + result.message);
          }
        } catch (error) {
          console.error("Error al actualizar el nombre:", error);
        }
      }
    });

    // Verificar si el botón y el campo de entrada existen
    if (!editButton || !inputField) {
      console.error("Elemento no encontrado en el DOM.");
      return;
    }
});
