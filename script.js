document.addEventListener('DOMContentLoaded', function () {
    const ccaaSelect = document.getElementById('ccaa');
    const provinciaSelect = document.getElementById('provincia');
    const poblacionSelect = document.getElementById('poblacion');
    const imageContainer = document.getElementById('image-container');
    const restaurantContainer = document.getElementById('restaurant-container');
    const submit = document.getElementById('submit');
    const batteryStatusContainer = document.createElement('div');
    batteryStatusContainer.id = 'battery-status';
    document.body.appendChild(batteryStatusContainer);

    const apiKey = 'Coic4-KP8EdRJJ9KPMrQ09gVr7D0hHqdUc73SZ5x9pYoPluFxeijfggqsd9U2hsoRQeIWGdyfqw_bKlD5u0gs7Fkvqk2Q0sAz5P905D6P1o2wtRESCeTilZcFry0Z3Yx';

    // Obtener comunidades autónomas
    async function getComunidadesAutonomas() {
        const response = await fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/ccaa.json');
        const data = await response.json();
        data.forEach(comunidad => {
            let options = document.createElement('option');
            options.value = comunidad.code;
            options.textContent = comunidad.label;
            ccaaSelect.appendChild(options);
        });
    }

    getComunidadesAutonomas();

    ccaaSelect.addEventListener('change', async function () {
        const response = await fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/provincias.json');
        const data = await response.json();
        provinciaSelect.innerHTML = '<option value="" disabled selected>Selecciona una Provincia</option>';
        data.forEach(provincia => {
            if (provincia.parent_code == ccaaSelect.value) {
                let options = document.createElement('option');
                options.value = provincia.code;
                options.textContent = provincia.label;
                provinciaSelect.appendChild(options);
            }
        });
    });

    provinciaSelect.addEventListener('change', async function () {
        const response = await fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/poblaciones.json');
        const data = await response.json();
        poblacionSelect.innerHTML = '<option value="" disabled selected>Selecciona una Población</option>';
        data.forEach(poblacion => {
            if (poblacion.parent_code == provinciaSelect.value) {
                let options = document.createElement('option');
                options.value = poblacion.code;
                options.textContent = poblacion.label;
                poblacionSelect.appendChild(options);
            }
        });
    });

    submit.addEventListener('click', function (event) {
        event.preventDefault();
        const poblacion = poblacionSelect.options[poblacionSelect.selectedIndex].text;

        if (poblacion) {
            const imageUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=images&titles=${encodeURIComponent(poblacion)}&gimlimit=10&prop=imageinfo&iiprop=url`;

            fetch(imageUrl)
                .then(response => response.json())
                .then(data => {
                    imageContainer.innerHTML = '';
                    if (data.query && data.query.pages) {
                        Object.values(data.query.pages).forEach(page => {
                            if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
                                const imgUrl = page.imageinfo[0].url;
                                const imgBox = document.createElement('div');
                                imgBox.className = 'image-box';
                                const img = document.createElement('img');
                                img.src = imgUrl;
                                imgBox.appendChild(img);
                                imageContainer.appendChild(imgBox);
                            }
                        });
                    } else {
                        imageContainer.innerHTML = '<p>No se encontraron imágenes para esta población.</p>';
                    }
                })
                .catch(error => {
                    console.error('Error cargando imágenes:', error);
                    imageContainer.innerHTML = '<p>Ocurrió un error al cargar las imágenes.</p>';
                });
        } else {
            alert('Por favor, selecciona una población.');
        }
    });

    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            function updateBatteryStatus() {
                batteryStatusContainer.innerHTML = `
                    <p><strong>Nivel de batería:</strong> ${Math.round(battery.level * 100)}%</p>
                    <p><strong>Estado:</strong> ${battery.charging ? 'Cargando' : 'No cargando'}</p>
                    <p><strong>Tiempo hasta carga completa:</strong> ${battery.chargingTime === Infinity ? 'Desconocido' : battery.chargingTime + 's'}</p>
                    <p><strong>Tiempo hasta descarga completa:</strong> ${battery.dischargingTime === Infinity ? 'Desconocido' : battery.dischargingTime + 's'}</p>
                `;
            }

            updateBatteryStatus();

            battery.addEventListener('chargingchange', updateBatteryStatus);
            battery.addEventListener('levelchange', updateBatteryStatus);
            battery.addEventListener('chargingtimechange', updateBatteryStatus);
            battery.addEventListener('dischargingtimechange', updateBatteryStatus);
        });
    } else {
        batteryStatusContainer.innerHTML = '<p>API de batería no soportada en este navegador.</p>';
    }
});
