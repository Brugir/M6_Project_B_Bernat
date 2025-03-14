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
    const mostrarDocsBtn = document.getElementById('mostrar-docs');
    const apiDocs = document.getElementById('api-docs');
    const copiarDocsBtn = document.getElementById('copiar-docs');

    const apiKey = 'Coic4-KP8EdRJJ9KPMrQ09gVr7D0hHqdUc73SZ5x9pYoPluFxeijfggqsd9U2hsoRQeIWGdyfqw_bKlD5u0gs7Fkvqk2Q0sAz5P905D6P1o2wtRESCeTilZcFry0Z3Yx';

    // Mostrar/Ocultar Documentación
    mostrarDocsBtn.addEventListener('click', function () {
        if (apiDocs.style.display === 'none' || apiDocs.style.display === '') {
            apiDocs.style.display = 'block';
            apiDocs.scrollIntoView({ behavior: 'smooth' });
        } else {
            apiDocs.style.display = 'none';
        }
    });

    // Copiar Documentación al Portapapeles
    function copiarDocs() {
        const apiContent = document.getElementById('api-content').innerText;
        navigator.clipboard.writeText(apiContent).then(() => {
            alert('Documentación copiada al portapapeles');
        }, (err) => {
            console.error('Error al copiar la documentación: ', err);
        });
    }
    copiarDocsBtn.addEventListener('click', copiarDocs);

    // Contenido de la Documentación de la API
    const apiDocsContent = `
        <p><strong>Comunidades Autónomas, Provincias y Poblaciones:</strong></p>
        <p>URL: <code>https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/ccaa.json</code></p>
        <p>Descripción: Obtiene la lista de Comunidades Autónomas en España.</p>
        <p>Método: GET</p>
        
        <p>URL: <code>https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/provincias.json</code></p>
        <p>Descripción: Obtiene la lista de Provincias en España, filtrada por Comunidad Autónoma.</p>
        <p>Método: GET</p>
        
        <p>URL: <code>https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/poblaciones.json</code></p>
        <p>Descripción: Obtiene la lista de Poblaciones en España, filtrada por Provincia.</p>
        <p>Método: GET</p>

        <p><strong>Imágenes de Wikimedia Commons:</strong></p>
        <p>URL: <code>https://commons.wikimedia.org/w/api.php</code></p>
        <p>Descripción: Obtiene imágenes de Wikimedia Commons relacionadas con la Población seleccionada.</p>
        <p>Método: GET</p>
        <p>Parámetros:</p>
        <ul>
            <li>action=query</li>
            <li>format=json</li>
            <li>origin=*</li>
            <li>generator=images</li>
            <li>titles={nombre_poblacion}</li>
            <li>gimlimit=10</li>
            <li>prop=imageinfo</li>
            <li>iiprop=url</li>
        </ul>

        <p><strong>Estado de la Batería (API de Batería):</strong></p>
        <p>Descripción: Permite obtener el estado actual de la batería del dispositivo.</p>
        <p>Método: Utiliza la interfaz <code>navigator.getBattery()</code> disponible en JavaScript.</p>
        <pre><code>navigator.getBattery().then(battery => {
    function updateBatteryStatus() {
        console.log(\`Nivel de batería: \${Math.round(battery.level * 100)}%\`);
        console.log(\`Estado: \${battery.charging ? 'Cargando' : 'No cargando'}\`);
        console.log(\`Tiempo hasta carga completa: \${battery.chargingTime === Infinity ? 'Desconocido' : battery.chargingTime + 's'}\`);
        console.log(\`Tiempo hasta descarga completa: \${battery.dischargingTime === Infinity ? 'Desconocido' : battery.dischargingTime + 's'}\`);
    }

    updateBatteryStatus();
    battery.addEventListener('chargingchange', updateBatteryStatus);
    battery.addEventListener('levelchange', updateBatteryStatus);
    battery.addEventListener('chargingtimechange', updateBatteryStatus);
    battery.addEventListener('dischargingtimechange', updateBatteryStatus);
    });</code></pre>
    `;
    document.getElementById('api-content').innerHTML = apiDocsContent;


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

    // Api de la bateria:

// Comprobamos si la API de batería está soportada en el navegador
if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        const batteryStatusContainer = document.getElementById('batteryStatusContainer');

        function getBatteryEmoji(level) {
            if (level >= 75) {
                return '😊'; // Feliz
            } else if (level >= 55) {
                return '🙂'; // Contento
            } else if (level >= 40) {
                return '😐'; // Neutral
            } else if (level >= 30) {
                return '😰'; // Cansado
            } else {
                return '😴'; // Con sueño
            }
        }

        function updateBatteryStatus() {
            const emoji = getBatteryEmoji(battery.level * 100);
            batteryStatusContainer.innerHTML = `
                <p><strong>Nivel de batería:</strong> ${Math.round(battery.level * 100)}% ${emoji}</p>
                <p><strong>Estado:</strong> ${battery.charging ? 'Cargando' : 'No cargando'}</p>
                <p><strong>Tiempo hasta carga completa:</strong> ${battery.chargingTime === Infinity ? 'Desconocido' : battery.chargingTime + 's'}</p>
                <p><strong>Tiempo hasta descarga completa:</strong> ${battery.dischargingTime === Infinity ? 'Desconocido' : battery.dischargingTime + 's'}</p>
            `;
        }

        // Llamamos a `updateBatteryStatus()` para mostrar la información al cargar la página
        updateBatteryStatus();

        // Configuramos escuchadores de eventos para actualizar la información de la batería
        battery.addEventListener('chargingchange', updateBatteryStatus);
        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingtimechange', updateBatteryStatus);
        battery.addEventListener('dischargingtimechange', updateBatteryStatus);
    });
} else {
    // Si la API de batería no es soportada por el navegador, mostramos un mensaje informativo.
    const batteryStatusContainer = document.getElementById('batteryStatusContainer');
    batteryStatusContainer.innerHTML = '<p>API de batería no soportada en este navegador.</p>';
}

});
