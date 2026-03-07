/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

/**
 * 1. FUNCIÓN: Obtener y pintar las reseñas
 */
async function fetchReviews() {
    const container = document.getElementById("reviews-container");

    if (!container) return;

    try {
        const response = await fetch("/api/reviews");

        if (!response.ok) throw new Error("Error en la cocina (Server Error)");

        const reviews = await response.json();

        if (!Array.isArray(reviews)) {
            return;
        }

        container.innerHTML = "";

        reviews.forEach((review) => {
            const stars = Math.max(0, Math.min(5, parseInt(review.estrellas) || 0));
            const starsHTML = "★".repeat(stars) + "☆".repeat(5 - stars);

            const card = document.createElement("div");
            card.className = "review-card";

            const header = document.createElement("div");
            header.className = "review-header";

            const avatar = document.createElement("a");
            avatar.href = escapeHTML(review.avatar || "#");
            avatar.className = "user-avatar";
            avatar.setAttribute("aria-label", `${escapeHTML(review.usuario)} profile picture`);

            const userInfo = document.createElement("div");
            userInfo.className = "user-info";

            const userName = document.createElement("h3");
            userName.textContent = review.usuario;

            const starsDiv = document.createElement("div");
            starsDiv.className = "stars";
            starsDiv.textContent = starsHTML;

            const comment = document.createElement("p");
            comment.textContent = `"${review.comentario}"`;

            userInfo.appendChild(userName);
            userInfo.appendChild(starsDiv);
            header.appendChild(avatar);
            header.appendChild(userInfo);
            card.appendChild(header);
            card.appendChild(comment);
            container.appendChild(card);
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
            credentials: "same-origin",
        });

        if (response.ok) {
            const user = await response.json();

            container.innerHTML = "";
            const wrapper = document.createElement("div");
            wrapper.style.cssText = "display: flex; gap: 10px; align-items: center;";

            const greeting = document.createElement("span");
            greeting.style.cssText = "font-weight: 500; color: #333;";
            greeting.textContent = `Hola, ${user.name}`;

            const btn = document.createElement("button");
            btn.className = "btn-login";
            btn.innerHTML = '<i class="fas fa-arrow-right"></i> Ir al Dashboard';
            btn.addEventListener("click", () => { location.href = "/dashboard"; });

            wrapper.appendChild(greeting);
            wrapper.appendChild(btn);
            container.appendChild(wrapper);
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
