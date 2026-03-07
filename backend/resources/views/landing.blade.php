<!doctype html>
<html lang="es">
	<head>
		<meta charset="UTF-8" />
		<link rel="icon" type="image/png" href="{{ asset('images/logo_budget.png') }}" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="csrf-token" content="{{ csrf_token() }}">
		<link
			rel="stylesheet"
			href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
		/>
		<link rel="stylesheet" href="{{ asset('css/landing.css') }}" />
		<title>BudgetBuddy | Tu control de gastos</title>
		<meta
			name="description"
			content="Controla tus gastos de manera eficiente con BudgetBuddy."
		/>
	</head>

	<body>
		<header>
			<div class="container header-content">
				<div class="logo-container">
					<img
						src="{{ asset('images/logo_budget.png') }}"
						alt="BudgetBuddy Logo"
						class="logo-img"
					/>
					<span class="logo-text">BudgetBuddy</span>
				</div>
				<nav>
					<ul>
						<li><a href="#hero">Inicio</a></li>
						<li><a href="#about">Cómo funciona?</a></li>
						<li><a href="#features">Funcionalidades</a></li>
						<li><a href="#contact">Contacto</a></li>
					</ul>
				</nav>
				<!--- NO TOCAR --->
				<div id="auth-buttons">
					<button class="btn-login" onclick="location.href = '/login'">
						Iniciar sesión
					</button>
					<button class="btn-secondary" onclick="location.href = '/register'">
						Registrate
					</button>
				</div>
				<!--- NO TOCAR --->
			</div>
		</header>

		<section id="hero">
			<div class="container hero-grid">
				<div class="hero-text">
					<h1>
						Toma el control de tu <span class="highlight">dinero</span> hoy.
					</h1>
					<p>
						BudgetBuddy es tu compañero inteligente para las finanzas
						estudiantiles. Controla gastos, planifica presupuestos y alcanza tus
						metas sin complicaciones.
					</p>
					<div class="hero-buttons">
						<button
							id="startButton"
							class="btn-primary"
							onclick="location.href = '/register'"
						>
							Empezar Gratis
						</button>
						<a href="#features" class="link-more">Saber más &darr;</a>
					</div>
				</div>
				<div class="hero-image">
					<div class="app-img">
						<img
							src="{{ asset('images/App-wireframe-removebg-preview.png') }}"
							alt=""
						/>
					</div>
				</div>
			</div>
		</section>

		<section id="about">
			<div class="container">
				<div class="about-content">
					<div class="about-text">
						<h2 class="section-title">Tu compañero financiero inteligente</h2>
						<p class="section-subtitle">
							BudgetBuddy está diseñado específicamente para el ritmo de vida
							estudiantil, ofreciendo herramientas prácticas que se adaptan a
							tus necesidades reales.
						</p>

						<div class="about-grid">
							<div class="about-item">
								<div class="about-icon">
									<i class="fas fa-graduation-cap"></i>
								</div>
								<div class="about-desc">
									<h3>Para estudiantes</h3>
									<p>
										Creado pensando en los presupuestos limitados y las
										necesidades específicas de la vida universitaria.
									</p>
								</div>
							</div>

							<div class="about-item">
								<div class="about-icon">
									<i class="fas fa-tags"></i>
								</div>
								<div class="about-desc">
									<h3>Categorización</h3>
									<p>
										Clasificación de gastos en supermercado, transporte, ocio y
										más, sin esfuerzo.
									</p>
								</div>
							</div>

							<div class="about-item">
								<div class="about-icon">
									<i class="fas fa-chart-line"></i>
								</div>
								<div class="about-desc">
									<h3>Visualización clara</h3>
									<p>
										Gráficos intuitivos que muestran tu progreso financiero y
										patrones de gasto de un vistazo.
									</p>
								</div>
							</div>

							<div class="about-item">
								<div class="about-icon">
									<i class="fas fa-bell"></i>
								</div>
								<div class="about-desc">
									<h3>Introducción a la inversión</h3>
									<p>
										Herramientas educativas para comenzar tu viaje en finanzas
										personales e inversión en ETF.
									</p>
								</div>
							</div>
						</div>

						<div class="about-process">
							<h3>¿Cómo funciona BudgetBuddy?</h3>
							<div class="process-steps">
								<div class="process-step">
									<div class="step-number">1</div>
									<h4>Configura tu presupuesto</h4>
									<p>
										Define tus límites mensuales arrastrando y soltando entre
										categorías.
									</p>
								</div>
								<div class="process-step">
									<div class="step-number">2</div>
									<h4>Registra tus gastos</h4>
									<p>
										Añade transacciones rápidamente desde cualquier dispositivo.
									</p>
								</div>
								<div class="process-step">
									<div class="step-number">3</div>
									<h4>Analiza y ajusta</h4>
									<p>
										Revisa tus gráficos y ajusta tu plan según tus objetivos.
									</p>
								</div>
							</div>
						</div>

						<div class="value-proposition">
							<div class="value-icon">
								<i class="fas fa-shield-alt"></i>
							</div>
							<div class="value-text">
								<h4>Control total, simplicidad absoluta</h4>
								<p>
									BudgetBuddy combina el poder de un tracker financiero
									profesional con la simplicidad que necesitas como estudiante.
									Tu dinero bajo control, tu futuro financiero en tus manos.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section id="features">
			<div class="container">
				<h2>¿Por qué BudgetBuddy?</h2>
				<div class="features-grid">
					<div class="card">
						<div class="feature-icon">
							<i class="fas fa-chart-pie"></i>
						</div>
						<h3>Control Total</h3>
						<p>
							Registra cada gasto e ingreso al instante y visualiza a dónde va
							tu dinero.
						</p>
					</div>
					<div class="card">
						<div class="feature-icon">
							<i class="fas fa-bullseye"></i>
						</div>
						<h3>Metas de Ahorro</h3>
						<p>Establece objetivos reales y sigue tu progreso mes a mes.</p>
					</div>
					<div class="card">
						<div class="feature-icon">
							<i class="fas fa-bolt"></i>
						</div>
						<h3>Rápido y Fácil</h3>
						<p>
							Diseñado para estudiantes: interfaz intuitiva sin complicaciones
							bancarias.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Sección de video promocional -->
		<div class="video-container" style="max-width: 800px; margin: 0 auto">
			<video
				id="mi-video-promo"
				width="100%"
				controls
				preload="metadata"
				aria-label="Video promocional de BudgetBuddy"
			>
				<source src="{{ asset('video/Video-budgetbuddy.mp4') }}" type="video/mp4" />

				<track
					src="{{ asset('video/subtitulos_es.vtt') }}"
					kind="captions"
					srclang="es"
					label="Español"
					default
				/>

				<p>
					Tu navegador no soporta videos HTML5.
					<a href="{{ asset('video/Video-budgetbuddy.mp4') }}">Descarga el video aquí</a>.
				</p>
			</video>
		</div>

		<!-- Sección Contacto -->
		<section id="contact">
			<div class="container">
				<div class="contact-content">
					<div class="contact-header">
						<h2 class="section-title">¿Necesitas ayuda o tienes preguntas?</h2>
						<p class="section-subtitle">
							Estamos aquí para ayudarte en tu viaje financiero. Contáctanos de
							la manera que te sea más conveniente.
						</p>
					</div>

					<div class="contact-grid">
						<div class="contact-info">
							<div class="contact-card">
								<div class="contact-icon">
									<i class="fas fa-envelope"></i>
								</div>
								<h3>Correo Electrónico</h3>
								<p>Para consultas generales y soporte</p>
								<a href="mailto:soporte@budgetbuddy.com" class="contact-link"
									>soporte@budgetbuddy.com</a
								>
								<p>Respuesta en 24 horas</p>
							</div>

							<div class="contact-card">
								<div class="contact-icon">
									<i class="fas fa-comments"></i>
								</div>
								<h3>Soporte en vivo</h3>
								<p>Asistencia directa para problemas técnicos</p>
								<a href="#" aria-label="Chat en vivo" class="contact-link">Chat en vivo</a>
								<p>Disponible 9:00 - 18:00 (GMT-5)</p>
							</div>

							<div class="contact-card">
								<div class="contact-icon">
									<i class="fas fa-book"></i>
								</div>
								<h3>Centro de Ayuda</h3>
								<p>Guías, tutoriales y preguntas frecuentes</p>
								<a href="#" class="contact-link">Ver documentación</a>
								<p>Acceso 24/7</p>
							</div>
						</div>

						<div class="contact-form-container">
							<div class="form-header">
								<h3>Envíanos un mensaje</h3>
								<p>
									Completa el formulario y nos pondremos en contacto contigo
									pronto.
								</p>
							</div>

							<form class="contact-form">
								<div class="form-group">
									<label for="name">Nombre completo *</label>
									<input
										type="text"
										id="name"
										name="name"
										required
										placeholder="Tu nombre"
									/>
								</div>

								<div class="form-group">
									<label for="email">Correo electrónico *</label>
									<input
										type="email"
										id="email"
										name="email"
										required
										placeholder="tu@email.com"
									/>
								</div>

								<div class="form-group">
									<label for="subject">Asunto *</label>
									<select id="subject" name="subject" required>
										<option value="" disabled selected>
											Selecciona un tema
										</option>
										<option value="support">Soporte técnico</option>
										<option value="billing">Facturación y pagos</option>
										<option value="suggestions">Sugerencias</option>
										<option value="partnership">Colaboraciones</option>
										<option value="other">Otro</option>
									</select>
								</div>

								<div class="form-group">
									<label for="message">Mensaje *</label>
									<textarea
										id="message"
										name="message"
										rows="5"
										required
										placeholder="Describe tu consulta o pregunta..."
									></textarea>
								</div>

								<div class="form-group checkbox-group">
									<input type="checkbox" id="newsletter" name="newsletter" />
									<label for="newsletter"
										>Deseo recibir consejos financieros y novedades de
										BudgetBuddy</label
									>
								</div>

								<button type="submit" class="btn-primary">
									Enviar mensaje
								</button>
							</form>
						</div>
					</div>

					<div class="contact-footer">
						<div class="social-links">
							<h4>Síguenos en redes sociales</h4>
							<div class="social-icons">
								<a href="#" class="social-icon" aria-label="Twitter">
									<i class="fab fa-twitter"></i>
								</a>
								<a href="#" class="social-icon" aria-label="Facebook">
									<i class="fab fa-facebook-f"></i>
								</a>
								<a href="#" class="social-icon" aria-label="Instagram">
									<i class="fab fa-instagram"></i>
								</a>
								<a href="#" class="social-icon" aria-label="LinkedIn">
									<i class="fab fa-linkedin-in"></i>
								</a>
							</div>
						</div>

						<div class="contact-note">
							<i class="fas fa-info-circle"></i>
							<p>
								BudgetBuddy está comprometido con la educación financiera
								estudiantil. Todos los servicios de soporte son gratuitos para
								nuestros usuarios.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!--- NO TOCAR --->
		<section id="reviews">
			<h2>Lo que dicen nuestros usuarios</h2>
			<div class="reviews-grid" id="reviews-container">
				<p>Cargando opiniones...</p>
			</div>
		</section>
		<!--- NO TOCAR --->

		<footer>
			<div class="container">
				<div class="footer-columns">
					<div class="footer-column">
						<h4>BudgetBuddy</h4>
						<ul>
							<li><a href="#hero">Inicio</a></li>
							<li><a href="#about">Cómo funciona</a></li>
							<li><a href="#features">Funcionalidades</a></li>
							<li><a href="#contact">Contacto</a></li>
						</ul>
					</div>

					<div class="footer-column">
						<h4>Soporte</h4>
						<ul>
							<li><a href="#">Centro de ayuda</a></li>
							<li><a href="#">Preguntas frecuentes</a></li>
							<li><a href="#">Tutoriales</a></li>
							<li><a href="#">Foro estudiantil</a></li>
						</ul>
					</div>

					<div class="footer-column">
						<h4>Legal</h4>
						<ul>
							<li><a href="#">Términos de servicio</a></li>
							<li><a href="#">Política de privacidad</a></li>
							<li><a href="#">Cookies</a></li>
							<li>
								<a href="/accesibilidad" class="accessibility-link"
									>Compromiso de accesibilidad</a
								>
							</li>
						</ul>
					</div>

					<div class="footer-column">
						<h4>Conéctate</h4>
						<div class="social-footer">
							<a href="#" class="social-footer-icon" aria-label="Twitter">
								<i class="fab fa-twitter"></i>
							</a>
							<a href="#" class="social-footer-icon" aria-label="Facebook">
								<i class="fab fa-facebook-f"></i>
							</a>
							<a href="#" class="social-footer-icon" aria-label="Instagram">
								<i class="fab fa-instagram"></i>
							</a>
							<a href="#" class="social-footer-icon" aria-label="LinkedIn">
								<i class="fab fa-linkedin-in"></i>
							</a>
						</div>
						<p class="footer-tagline">
							Tu compañero financiero para la vida universitaria
						</p>
						<div class="footer-logo">
							<img
								src="{{ asset('images/logo_budget.png') }}"
								alt="BudgetBuddy Logo"
								class="footer-logo-img"
							/>
							<span class="footer-logo-text">BudgetBuddy</span>
						</div>
					</div>
				</div>

				<div class="footer-divider"></div>

				<div class="footer-base">
					<div class="footer-copyright">
						<p>&copy; 2026 BudgetBuddy. Todos los derechos reservados.</p>
					</div>

					<div class="footer-links">
						<a href="#">Mapa del sitio</a>
						<a href="#">Política de privacidad</a>
						<a href="#">Términos de uso</a>
						<a href="/accesibilidad" class="accessibility-link"
							>Compromiso de accesibilidad</a
						>
						<a href="#">Aviso legal</a>
					</div>

					<div class="footer-back-top">
						<a href="#hero" class="back-to-top">
							<i class="fas fa-chevron-up"></i>
							<span>Volver arriba</span>
						</a>
					</div>
				</div>
			</div>
		</footer>
		<script src="{{ asset('js/landing.js') }}"></script>
	</body>
</html>
