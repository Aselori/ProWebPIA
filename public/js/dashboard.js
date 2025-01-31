
document.addEventListener("DOMContentLoaded", function () {
    fetch('/users-by-date')
        .then(response => response.json())
        .then(data => {
            const dates = data.map(item => item.date);
            const counts = data.map(item => item.count);

            const ctx = document.getElementById('usersChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Usuarios registrados',
                        data: counts,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                        fill: true,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)'
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                precision: 0 
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error("Error loading data:", error));
});
