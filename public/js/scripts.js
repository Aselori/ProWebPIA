document.addEventListener('DOMContentLoaded', function() { 

    
    // Campo de búsqueda
    const busquedaInput = document.getElementById('busqueda');
    const resultadosList = document.getElementById('resultados');

    if (busquedaInput) {
        busquedaInput.addEventListener('input', function() {
            const query = this.value;
            if (query.length > 0) {
                fetch(`/buscar?q=${query}`)
                .then(response => response.json())
                .then(data => {
                    resultadosList.innerHTML = ''; // Clear previous results
                    data.forEach(item => {
                        const li = document.createElement('li');
                        li.className = 'p-2 hover:bg-gray-200 cursor-pointer'; // Styling for results
                        li.textContent = item;
                        li.addEventListener('click', function() {
                            window.location.href = `/perfil-profesor?q=${encodeURIComponent(item)}`; // Navigate to profile
                        });
                        resultadosList.appendChild(li);
                    });
                })
                .catch(error => console.error('Error en la búsqueda:', error));
            } else {
                resultadosList.innerHTML = ''; // Clear if no input
            }
        });

        // Capturar el evento Enter en el campo de búsqueda
        busquedaInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default behavior
                const query = this.value;
                window.location.href = `/perfil-profesor?q=${encodeURIComponent(query)}`;
            }
        });
    }

    // Manejo de "likes" y "dislikes"
    const likeButtons = document.querySelectorAll('.like-button');
    const dislikeButtons = document.querySelectorAll('.dislike-button');

    likeButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const profesorId = this.dataset.profesorId;
            handleLikeDislike(profesorId, true, this); // true para "like"
        });
    });

    dislikeButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const profesorId = this.dataset.profesorId;
            handleLikeDislike(profesorId, false, this); // false para "dislike"
        });
    });

    function handleLikeDislike(profesorId, isLike, button) {
        fetch(`/like-dislike`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profesorId, isLike })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Datos recibidos del servidor:', JSON.stringify(data, null, 2)); // Verifica la respuesta
    
            if (data.success) {
                // Encuentra los contadores usando `data-profesor-id`
                const likeCountSpan = document.querySelector(`.like-count[data-profesor-id="${profesorId}"]`);
                const dislikeCountSpan = document.querySelector(`.dislike-count[data-profesor-id="${profesorId}"]`);
                
                // Verificación adicional
                if (!likeCountSpan) {
                    console.error(`No se encontró el contador de "likes" para el profesor con ID ${profesorId}.`);
                }
                if (!dislikeCountSpan) {
                    console.error(`No se encontró el contador de "dislikes" para el profesor con ID ${profesorId}.`);
                }
    
                if (likeCountSpan && dislikeCountSpan) {
                    // Actualiza los contadores
                    likeCountSpan.textContent = data.newLikes;
                    dislikeCountSpan.textContent = data.newDislikes;
                } else {
                    console.error('No se encontraron los contadores de "likes" o "dislikes" en el DOM.');
                }
    
                // Cambia el estado de los botones en el DOM
                if (isLike) {
                    const correspondingDislikeButton = button.closest('.flex').querySelector('.dislike-button');
                    if (correspondingDislikeButton) {
                        correspondingDislikeButton.classList.remove('active');
                    }
                    button.classList.add('active');
                } else {
                    const correspondingLikeButton = button.closest('.flex').querySelector('.like-button');
                    if (correspondingLikeButton) {
                        correspondingLikeButton.classList.remove('active');
                    }
                    button.classList.add('active');
                }
            } else {
                alert('Hubo un problema al registrar tu acción.');
            }
        })
        .catch(error => console.error('Error al procesar la acción:', error));
    }

    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const selectedOption = document.getElementById('selectedOption');
    const profesorContainer = document.querySelector('.grid'); // Container for profesor cards

    // Toggle dropdown visibility
    dropdownButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
    });

    // Handle option selection
    dropdownMenu.addEventListener('click', (event) => {
        const selectedValue = event.target.getAttribute('data-value');
        if (selectedValue) {
            selectedOption.textContent = selectedValue;
            sortProfesores(selectedValue);
        }
        dropdownMenu.classList.add('hidden'); // Hide menu after selection
    });

    // Sort profesores based on the selected option
    function sortProfesores(order) {
        const profesorCards = Array.from(profesorContainer.getElementsByClassName('profesor-card'));

        profesorCards.sort((a, b) => {
            const diffA = parseInt(a.getAttribute('data-diff'), 10);
            const diffB = parseInt(b.getAttribute('data-diff'), 10);

            // Invert the sorting logic
            return order === 'RATING ASC' ? diffA - diffB : diffB - diffA;
        });

        // Reorder elements in the container
        profesorCards.forEach(card => profesorContainer.appendChild(card));
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    // Initial sort by default
    sortProfesores('RATING DESC');
});
