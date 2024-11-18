document.addEventListener('DOMContentLoaded', function() {
    // Campo de búsqueda
    const busquedaInput = document.getElementById('busqueda');
    const resultadosList = document.getElementById('resultados');

    busquedaInput.addEventListener('input', function() {
        const query = this.value;

        // Solo buscar si hay más de una letra
        if (query.length > 0) {
            fetch(`/buscar?q=${query}`)
            .then(response => response.json())
            .then(data => {
                resultadosList.innerHTML = ''; // Limpiar resultados anteriores

                // Mostrar resultados
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'p-2 hover:bg-gray-200 cursor-pointer'; // Estilos para los resultados
                    li.textContent = item;

                    // Evento de clic en cada resultado
                    li.addEventListener('click', function() {
                        busquedaInput.value = item; // Rellenar el campo de búsqueda con el resultado seleccionado
                        resultadosList.innerHTML = ''; // Limpiar la lista de resultados después de seleccionar
                    });

                    resultadosList.appendChild(li);
                });
            })
            .catch(error => console.error('Error en la búsqueda:', error));
        } else {
            resultadosList.innerHTML = ''; // Limpiar si no hay texto
        }
    });

    // Capturar el evento Enter en el campo de búsqueda
    busquedaInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evitar el comportamiento por defecto

            const query = this.value;

            // Redirigir al usuario a una nueva página con la búsqueda
            window.location.href = `/perfil-profesor?q=${encodeURIComponent(query)}`;
        }
    });
});
