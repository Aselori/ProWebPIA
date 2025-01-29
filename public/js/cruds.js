async function updateStatus(reportId) {
    try {
        const response = await fetch('/updateStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: reportId, newStatus: 4 })
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Estado actualizado correctamente');
            location.reload(); // Recargar la página para ver los cambios
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error al actualizar el estado:', error);
    }
}