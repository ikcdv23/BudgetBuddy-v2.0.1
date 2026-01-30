import "../css/style.css";

/**
 * 1. FUNCIÓN: Obtener y pintar las reseñas
 */
async function fetchReviews() {
    const container = document.getElementById("reviews-container");

    // Si no existe el contenedor en este HTML, no hacemos nada (evita errores en otras páginas)
    if (!container) return;

    try {
        // A. Llamamos al servidor
        const response = await fetch("/api/reviews");

        // B. Verificamos respuesta
        if (!response.ok) throw new Error("Error en la cocina (Server Error)");
        
        const reviews = await response.json();

        // Depuración (Mantenemos tus logs intactos)
        console.log("--- INICIO DEPURACIÓN ---");
        console.log("TIPO DE DATO:", typeof reviews);
        console.log("CONTENIDO EXACTO:", reviews);
        console.log("--- FIN DEPURACIÓN ---");

        // C. Verificación de seguridad (Array)
        if (!Array.isArray(reviews)) {
            console.error("¡ALERTA! PHP no está enviando un array. Está enviando:", reviews);
            return; 
        }

        // D. Limpiamos contenedor
        container.innerHTML = "";

        // E. Pintamos las reseñas
        reviews.forEach((review) => {
            // Estrellas dinámicas
            const starsHTML = "★".repeat(review.estrellas) + "☆".repeat(5 - review.estrellas);

            // HTML de la tarjeta
            const cardHTML = `
                <div class="review-card">
                    <div class="review-header">
                        <a href="${review["avatar"]}" alt="${review.usuario} profile picture" class="user-avatar"></a>
                        <div class="user-info">
                            <h3>${review.usuario}</h3>
                            <div class="stars">${starsHTML}</div>
                        </div>
                    </div>
                    <p>"${review.comentario}"</p>
                </div>
            `;

            // Insertamos en el DOM
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Error cargando reseñas:", error);
        if (container) {
            container.innerHTML = "<p>Error al cargar las opiniones. Inténtalo más tarde.</p>";
        }
    }
}

/**
 * 2. FUNCIÓN: Comprobar sesión de usuario
 */
async function checkAuthStatus() {
    // Buscamos el contenedor de botones. Si no existe, paramos.
    const container = document.getElementById("auth-buttons");
    if (!container) return;

    try {
        // Petición a la API para ver si hay usuario
        const response = await fetch("/api/user", {
            headers: {
                Accept: "application/json",
            },
        });

        // Si responde OK (200), el usuario está logueado
        if (response.ok) {
            const user = await response.json();

            // Reemplazamos botones de Login/Registro por el de Dashboard
            container.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="font-weight: 500; color: #333;">Hola, ${user.name}</span>
                    <button class="btn-login" onclick="location.href='/dashboard'">
                        <i class="fas fa-arrow-right"></i> Ir al Dashboard
                    </button>
                </div>
            `;
        }
    } catch (error) {
        // Si falla (401 o error de red), asumimos visitante y no tocamos nada.
        console.log("Usuario no autenticado (Visitante)");
    }
}

/**
 * 3. INICIALIZACIÓN: Ejecutar todo cuando el DOM esté listo
 */
document.addEventListener("DOMContentLoaded", () => {
    // Ejecutamos ambas funciones
    fetchReviews();
    checkAuthStatus();
});