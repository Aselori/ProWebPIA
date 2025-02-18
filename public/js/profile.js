document.addEventListener("DOMContentLoaded", function () {
    const editButton = document.getElementById('editProfileBtn');
    const inputField = document.getElementById('newName');

    if (!editButton || !inputField) {
        console.error("Elemento no encontrado en el DOM.");
        return;
    }

    editButton.addEventListener('click', async function() {
        if (inputField.style.display === 'none') {
            inputField.style.display = 'inline-block';
            this.textContent = 'Guardar Cambios';
        } else {
            const newName = inputField.value;

            if (!newName.trim()) {
                alert("El nuevo nombre no puede estar vacío.");
                return;
            }

            try {
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
                    setTimeout(() => { location.reload(); }, 500); // ✅ RECARGA LA PÁGINA
                } else {
                    alert("Error: " + result.message);
                }
            } catch (error) {
                console.error("Error al actualizar el nombre:", error);
            }
        }
    });
});


