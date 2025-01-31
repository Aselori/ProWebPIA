function gestionarSolicitud(id, action) {
    fetch("/gestionar-solicitud-maestro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        location.reload(); // Recargar para actualizar el estado en la tabla
    })
    .catch(error => console.error("Error al gestionar la solicitud:", error));
}



document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("solicitud-maestro-form");
    
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            
            const formData = new FormData(form);

            fetch("/nueva-solicitud-maestro", {
                method: "POST",
                body: new URLSearchParams(formData),
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    form.reset();
                }
            })
            .catch(error => console.error("Error al enviar la solicitud:", error));
        });
    }
});
   




