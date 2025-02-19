document.addEventListener('DOMContentLoaded', function () {
    const ccaaSelect = document.getElementById('ccaa');
    const provinciaSelect = document.getElementById('provincia');
    const poblacionSelect = document.getElementById('poblacion');
    const imageContainer = document.getElementById('image-container');
    const submit = document.getElementById('submit');

    const apiKey = 'Coic4-KP8EdRJJ9KPMrQ09gVr7D0hHqdUc73SZ5x9pYoPluFxeijfggqsd9U2hsoRQeIWGdyfqw_bKlD5u0gs7Fkvqk2Q0sAz5P905D6P1o2wtRESCeTilZcFry0Z3Yx';  // API Key de Yelp

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

    // Obtener provincias
    async function getProvincias() {
        const response = await fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/provincias.json');
        const data = await response.json();
        provinciaSelect.innerHTML = "";
        let options = document.createElement('option');
        options.text = "Selecciona una Provincia";
        provinciaSelect.appendChild(options);
        data.forEach(provincia => {
            if (provincia.parent_code == ccaaSelect.value) {
                let options = document.createElement('option');
                options.value = provincia.code;
                options.textContent = provincia.label;
                provinciaSelect.appendChild(options);
            }
        });
    }

    ccaaSelect.addEventListener('change', function () {
        getProvincias();
    });

    // Obtener poblaciones
    async function getPoblaciones() {
        const response = await fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/poblaciones.json');
        const data = await response.json();
        poblacionSelect.innerHTML = "";
        let options = document.createElement('option');
        options.text = "Selecciona una Población";
        poblacionSelect.appendChild(options);
        data.forEach(poblacion => {
            if (poblacion.parent_code == provinciaSelect.value) {
                let options = document.createElement('option');
                options.value = poblacion.code;
                options.textContent = poblacion.label;
                poblacionSelect.appendChild(options);
            }
        });
    }

    provinciaSelect.addEventListener('change', function () {
        getPoblaciones();
    });

    // Función para obtener imágenes de Wikimedia
    submit.addEventListener('click', function (event) {
        event.preventDefault();
        const poblacion = poblacionSelect.options[poblacionSelect.selectedIndex].text;

        if (poblacion) {
            const imageUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=images&titles=${encodeURIComponent(poblacion)}&gimlimit=10&prop=imageinfo&iiprop=url`;

            // Llamada a la API de Wikimedia
            fetch(imageUrl)
                .then(response => response.json())
                .then(data => {
                    console.log("Imágenes de Wikimedia:", data);

                    imageContainer.innerHTML = ''; // Limpiar imágenes previas
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

            // Guardar la población en localStorage
            localStorage.setItem('poblacion', poblacion);

            // Buscar restaurantes en Yelp
            getRestaurants(poblacion);
        } else {
            alert('Por favor, selecciona una población.');
        }
    });

    // Función para obtener restaurantes de Yelp con base en una ubicación dada
async function getRestaurants(location) {
    // Construimos la URL de la API de Yelp, incluyendo la ubicación y limitando los resultados a 5
    const url = `https://api.yelp.com/v3/businesses/search?term=restaurants&location=${encodeURIComponent(location)}&limit=5`;

    // Realizamos la solicitud a la API de Yelp usando fetch, incluyendo la clave de autorización en los headers
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}` // Se envía la API Key en la cabecera para autenticación
        }
    });

    // Convertimos la respuesta a formato JSON para poder manipular los datos
    const data = await response.json();
    
    // Seleccionamos el contenedor donde se mostrarán los restaurantes
    const restaurantContainer = document.getElementById('restaurant-container');
    
    // Limpiamos el contenido previo del contenedor para evitar duplicados
    restaurantContainer.innerHTML = '';  

    // Verificamos si la API ha devuelto una lista de negocios (restaurantes)
    if (data.businesses && data.businesses.length > 0) {
        // Recorremos cada restaurante en los datos obtenidos de la API
        data.businesses.forEach(restaurant => {
            // Creamos un nuevo elemento <div> para mostrar la información del restaurante
            const restaurantDiv = document.createElement('div');
            restaurantDiv.classList.add('restaurant'); // Se le asigna una clase para estilos CSS
            
            // Insertamos los detalles del restaurante en el HTML dentro del div creado
            restaurantDiv.innerHTML = `
                <h3>${restaurant.name}</h3> <!-- Nombre del restaurante -->
                <p><strong>Rating:</strong> ${restaurant.rating} ★</p> <!-- Puntuación en Yelp -->
                <p><strong>Dirección:</strong> ${restaurant.location.address1}, ${restaurant.location.city}, ${restaurant.location.zip_code}</p> <!-- Dirección completa -->
                <p><strong>Teléfono:</strong> ${restaurant.phone || 'No disponible'}</p> <!-- Teléfono (si está disponible) -->
                <a href="${restaurant.url}" target="_blank">Ver más en Yelp</a> <!-- Enlace a Yelp -->
            `;
            
            // Agregamos el div con la información del restaurante al contenedor en la página
            restaurantContainer.appendChild(restaurantDiv);
        });
    } else {
        // Si no se encontraron restaurantes en la ubicación ingresada, mostramos un mensaje
        restaurantContainer.innerHTML = '<p>No se encontraron restaurantes en esta ubicación.</p>';
    }
}


    // Comprobar si hay una población guardada y mostrarla
    const poblacionGuardada = localStorage.getItem('poblacion');
    if (poblacionGuardada) {
        alert(`Población guardada en localStorage: ${poblacionGuardada}`);
    }
});
