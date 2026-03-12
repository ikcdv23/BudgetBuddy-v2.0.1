@extends('layouts.budgetbuddy')

@section('title', 'Ajustes')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/backajustes.css') }}" />
@endpush

@section('content')
<script>
    window.__ajustesData = {
        avatar: @json($user->profile?->avatar),
        currency: @json($user->profile?->currency ?? 'EUR'),
        name: @json($user->name),
        lastname: @json($user->profile?->lastname ?? ''),
        email: @json($user->email),
        phone: @json($user->profile?->phone ?? ''),
        phoneCountryCode: @json($user->profile?->phone_country_code ?? '+34')
    };
</script>

<!-- Tab Bar -->
<div class="settings-tabs">
    <button class="settings-tab active" data-tab="profile">
        <i class="fas fa-user"></i> Mi Perfil
    </button>
    <button class="settings-tab" data-tab="config">
        <i class="fas fa-cog"></i> Configuración
    </button>
</div>

<!-- ===================== TAB 1: MI PERFIL ===================== -->
<div class="tab-content active" id="tab-profile">

    <!-- Hero: Avatar + Nombre -->
    <div class="profile-hero">
        <div class="profile-avatar-hero" id="avatar-hero" title="Cambiar avatar">
            <div class="avatar-content" id="avatar-content">
                {{-- JS renderiza el avatar --}}
            </div>
            <div class="avatar-edit-overlay">
                <i class="fas fa-camera"></i>
            </div>
        </div>
        <h2 class="profile-hero-name" id="hero-name">{{ $user->name }} {{ $user->profile?->lastname ?? '' }}</h2>
        <p class="profile-hero-email" id="hero-email">{{ $user->email }}</p>
    </div>

    <!-- Card: Datos personales -->
    <div class="card">
        <div class="card-header-compact">
            <h2 class="card-title"><i class="fas fa-id-card"></i> Datos personales</h2>
        </div>
        <form class="profile-form" id="profile-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="first-name">Nombre</label>
                    <input type="text" id="first-name" value="{{ $user->name }}" required>
                </div>
                <div class="form-group">
                    <label for="last-name">Apellido</label>
                    <input type="text" id="last-name" value="{{ $user->profile?->lastname ?? '' }}">
                </div>
            </div>
            <div class="form-group">
                <label for="email">Correo electrónico</label>
                <input type="email" id="email" value="{{ $user->email }}" required>
            </div>
            <div class="form-group">
                <label for="phone">Teléfono</label>
                <div class="phone-input-row">
                    <select id="phone_country_code">
                        @php $cc = $user->profile?->phone_country_code ?? '+34'; @endphp
                        <option value="+34" {{ $cc === '+34' ? 'selected' : '' }}>+34</option>
                        <option value="+33" {{ $cc === '+33' ? 'selected' : '' }}>+33</option>
                        <option value="+49" {{ $cc === '+49' ? 'selected' : '' }}>+49</option>
                        <option value="+39" {{ $cc === '+39' ? 'selected' : '' }}>+39</option>
                        <option value="+351" {{ $cc === '+351' ? 'selected' : '' }}>+351</option>
                        <option value="+44" {{ $cc === '+44' ? 'selected' : '' }}>+44</option>
                        <option value="+1" {{ $cc === '+1' ? 'selected' : '' }}>+1</option>
                    </select>
                    <input type="tel" id="phone" value="{{ $user->profile?->phone ?? '' }}" data-format="phone" maxlength="11" inputmode="numeric" placeholder="612 345 678">
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary" id="save-profile-btn">
                    <i class="fas fa-save"></i> Guardar cambios
                </button>
            </div>
        </form>
    </div>

    <!-- Card: Seguridad -->
    <div class="card">
        <div class="card-header-compact">
            <h2 class="card-title"><i class="fas fa-shield-alt"></i> Seguridad</h2>
        </div>
        <div class="security-settings">
            <div class="security-item">
                <div class="security-info">
                    <h4>Cambiar contraseña</h4>
                    <p>Actualiza tu contraseña de acceso</p>
                </div>
                <button class="btn btn-secondary" id="change-password-btn">
                    <i class="fas fa-key"></i> Cambiar
                </button>
            </div>
        </div>
    </div>
</div>

<!-- ===================== TAB 2: CONFIGURACIÓN ===================== -->
<div class="tab-content" id="tab-config">

    <!-- Card: Tema de la app -->
    <div class="card">
        <div class="card-header-compact">
            <h2 class="card-title"><i class="fas fa-palette"></i> Tema de la app</h2>
        </div>
        <div class="theme-selector" id="theme-selector">
            <div class="theme-option" data-theme="light">
                <i class="fas fa-sun"></i>
                <span>Claro</span>
            </div>
            <div class="theme-option" data-theme="dark">
                <i class="fas fa-moon"></i>
                <span>Oscuro</span>
            </div>
            <div class="theme-option" data-theme="auto">
                <i class="fas fa-circle-half-stroke"></i>
                <span>Automático</span>
            </div>
        </div>
    </div>

    <!-- Card: Gestión de datos -->
    <div class="card">
        <div class="card-header-compact">
            <h2 class="card-title"><i class="fas fa-database"></i> Gestión de datos</h2>
        </div>
        <div class="data-management">
            <div class="security-item">
                <div class="security-info">
                    <h4>Exportar movimientos</h4>
                    <p>Descarga todos tus movimientos en formato CSV</p>
                </div>
                <button class="btn btn-secondary" id="export-csv-btn">
                    <i class="fas fa-download"></i> Exportar
                </button>
            </div>
            <div class="danger-item">
                <div class="security-info">
                    <h4>Eliminar cuenta</h4>
                    <p>Esta acción es irreversible. Se borrarán todos tus datos.</p>
                </div>
                <button class="btn btn-danger" id="delete-account-btn">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </div>
        </div>
    </div>

    <!-- Card: Planes futuros -->
    <div class="card">
        <div class="card-header-compact">
            <h2 class="card-title"><i class="fas fa-rocket"></i> Próximamente</h2>
        </div>
        <div class="future-plans-list">
            <div class="future-plan-item">
                <div class="future-plan-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="future-plan-info">
                    <h4>Gamificación</h4>
                    <p>Desbloquea cosméticos y logros al cumplir metas de ahorro</p>
                </div>
                <span class="future-plan-badge">Próximamente</span>
            </div>
            <div class="future-plan-item">
                <div class="future-plan-icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
                    <i class="fas fa-bell"></i>
                </div>
                <div class="future-plan-info">
                    <h4>Notificaciones</h4>
                    <p>Alertas de presupuesto, recordatorios y resúmenes semanales</p>
                </div>
                <span class="future-plan-badge">Próximamente</span>
            </div>
        </div>
    </div>

    <!-- Card: Acerca de -->
    <div class="card">
        <div class="card-header-compact">
            <h2 class="card-title"><i class="fas fa-info-circle"></i> Acerca de</h2>
        </div>
        <div class="about-info">
            <p><strong>BudgetBuddy</strong> v2.2.1</p>
            <p>Tu compañero de finanzas personales</p>
        </div>
    </div>

    <!-- Cerrar sesión -->
    <div class="card">
        <div class="logout-item">
            <div class="security-info">
                <h4>Cerrar sesión</h4>
            </div>
            <button class="btn btn-secondary" id="logout-btn">
                <i class="fas fa-sign-out-alt"></i> Salir
            </button>
        </div>
    </div>
</div>

<!-- ===================== MODALES ===================== -->

<!-- Modal: Avatar Picker -->
<div class="modal" id="avatar-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-user-circle"></i> Cambiar avatar</h3>
            <button class="close-modal" data-modal="avatar-modal">&times;</button>
        </div>
        <div class="modal-body">
            <p class="modal-description">Elige un icono o sube tu propia foto</p>

            <h4 class="avatar-section-title">Iconos predefinidos</h4>
            <div class="avatar-preset-grid" id="avatar-preset-grid">
                {{-- JS renderiza los 8 presets --}}
            </div>

            <div class="avatar-divider"><span>o</span></div>

            <div class="avatar-upload-zone" id="avatar-upload-zone">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Arrastra una imagen o <strong>haz clic para seleccionar</strong></p>
                <span class="avatar-upload-hint">JPG o PNG, máximo 2 MB</span>
                <input type="file" id="avatar-file-input" accept="image/jpeg,image/png" class="hidden">
            </div>

            <div class="avatar-upload-preview hidden" id="avatar-upload-preview">
                <img id="avatar-preview-img" alt="Preview">
                <button class="btn btn-secondary btn-sm" id="avatar-remove-preview">
                    <i class="fas fa-times"></i> Quitar
                </button>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" data-modal="avatar-modal">Cancelar</button>
            <button class="btn btn-primary" id="avatar-save-btn">
                <i class="fas fa-check"></i> Guardar
            </button>
        </div>
    </div>
</div>

<!-- Modal: Cambiar Contraseña -->
<div class="modal" id="password-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-key"></i> Cambiar contraseña</h3>
            <button class="close-modal" data-modal="password-modal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="password-form">
                <div class="form-group">
                    <label for="current-password">Contraseña actual</label>
                    <input type="password" id="current-password" required>
                </div>
                <div class="form-group">
                    <label for="new-password">Nueva contraseña</label>
                    <input type="password" id="new-password" required minlength="8">
                </div>
                <div class="form-group">
                    <label for="confirm-password">Confirmar nueva contraseña</label>
                    <input type="password" id="confirm-password" required minlength="8">
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" data-modal="password-modal">Cancelar</button>
            <button class="btn btn-primary" id="password-save-btn">
                <i class="fas fa-save"></i> Guardar
            </button>
        </div>
    </div>
</div>

<!-- Modal: Eliminar cuenta -->
<div class="modal" id="delete-account-modal">
    <div class="modal-content">
        <div class="modal-header" style="background: linear-gradient(135deg, #dc2626, #991b1b);">
            <h3><i class="fas fa-exclamation-triangle"></i> Eliminar cuenta</h3>
            <button class="close-modal" data-modal="delete-account-modal">&times;</button>
        </div>
        <div class="modal-body">
            <p class="modal-description">
                Esta acción es <strong>permanente e irreversible</strong>. Se eliminarán todas tus cuentas, tarjetas, movimientos y datos de perfil.
            </p>
            <div class="form-group">
                <label for="delete-password">Introduce tu contraseña para confirmar</label>
                <input type="password" id="delete-password" required placeholder="Tu contraseña actual">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" data-modal="delete-account-modal">Cancelar</button>
            <button class="btn btn-danger" id="delete-confirm-btn">
                <i class="fas fa-trash-alt"></i> Eliminar mi cuenta
            </button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/backajustes.js') }}"></script>
@endpush
