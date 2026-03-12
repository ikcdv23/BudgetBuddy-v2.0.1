@extends('layouts.budgetbuddy')

@section('title', 'Mi cuenta')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/backajustes.css') }}" />
@endpush

@section('content')
<div class="page-header">
    <h1 class="page-title">Mi cuenta</h1>
    <button class="btn btn-secondary" id="edit-profile-btn">
        <i class="fas fa-edit"></i> Editar perfil
    </button>
</div>

<div class="desktop-grid">
    <section class="desktop-left-column">
        <div class="card">
            <div class="card-header-compact">
                <h2 class="card-title">Perfil</h2>
            </div>

            <div class="profile-view-mode" id="profile-view-mode">
                <div class="profile-avatar-section">
                    <div class="profile-avatar-large">
                        {{ strtoupper(substr($user->name, 0, 1) . substr($user->profile->lastname ?? '', 0, 1)) }}
                    </div>
                    <div class="profile-name-view">
                        <h3>{{ $user->name }} {{ $user->profile->lastname ?? '' }}</h3>
                    </div>
                </div>
                <div class="profile-info-view">
                    <div class="info-row">
                        <div class="info-label">Correo</div>
                        <div class="info-value">{{ $user->email }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Teléfono</div>
                        <div class="info-value">
                            @if($user->profile->phone ?? null)
                                {{ $user->profile->phone_country_code ?? '+34' }} {{ $user->profile->phone }}
                            @else
                                Sin teléfono
                            @endif
                        </div>
                    </div>
                </div>
            </div>

            <div class="profile-edit-mode" id="profile-edit-mode" style="display: none;">
                <div class="profile-avatar-section">
                    <div class="profile-avatar-large">
                        {{ strtoupper(substr($user->name, 0, 1)) }}
                    </div>
                </div>

                <form class="profile-form" id="profile-form" action="{{ route('profile.update') }}" method="POST">
                    @csrf
                    @method('PUT')
                    <div class="form-row">
                        <div class="form-group">
                            <label for="first-name">Nombre</label>
                            <input type="text" name="first_name" id="first-name" class="editable-input" value="{{ old('first_name', $user->name) }}" required>
                            @error('first_name') <span class="text-danger text-sm">{{ $message }}</span> @enderror
                        </div>
                        <div class="form-group">
                            <label for="last-name">Apellido</label>
                            <input type="text" name="last_name" id="last-name" class="editable-input" value="{{ old('last_name', $user->profile->lastname ?? '') }}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="email">Correo electrónico</label>
                        <input type="email" name="email" id="email" class="editable-input" value="{{ old('email', $user->email) }}" required>
                        @error('email') <span class="text-danger text-sm">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="phone">Teléfono</label>
                        <div style="display: flex; align-items: stretch;">
                            <select name="phone_country_code" id="phone_country_code" class="editable-input" style="min-width: 95px; width: auto; border-right: none; border-radius: 8px 0 0 8px;">
                                @php $cc = old('phone_country_code', $user->profile->phone_country_code ?? '+34'); @endphp
                                <option value="+34" {{ $cc === '+34' ? 'selected' : '' }}>+34</option>
                                <option value="+33" {{ $cc === '+33' ? 'selected' : '' }}>+33</option>
                                <option value="+49" {{ $cc === '+49' ? 'selected' : '' }}>+49</option>
                                <option value="+39" {{ $cc === '+39' ? 'selected' : '' }}>+39</option>
                                <option value="+351" {{ $cc === '+351' ? 'selected' : '' }}>+351</option>
                                <option value="+44" {{ $cc === '+44' ? 'selected' : '' }}>+44</option>
                                <option value="+1" {{ $cc === '+1' ? 'selected' : '' }}>+1</option>
                            </select>
                            <input type="tel" name="phone" id="phone" class="editable-input" value="{{ old('phone', $user->profile->phone ?? '') }}" data-format="phone" maxlength="11" inputmode="numeric" placeholder="612 345 678" style="border-radius: 0 8px 8px 0;">
                        </div>
                    </div>

                    @if ($errors->any()) <div id="form-has-errors" class="hidden"></div> @endif

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-edit-btn">Cancelar</button>
                        <button type="submit" class="btn btn-primary" id="save-changes-btn">Guardar cambios</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="card">
            <div class="card-header-compact"><h2 class="card-title">Seguridad</h2></div>
            <div class="security-settings">
                <div class="security-item">
                    <div class="security-info"><h4>Cambiar contraseña</h4></div>
                    <button class="btn btn-secondary" id="change-password-btn">Cambiar</button>
                </div>
            </div>
        </div>
    </section>

    <section class="desktop-right-column">
        <div class="card">
            <div class="card-header-compact"><h2 class="card-title">Más opciones</h2></div>
            <div class="other-settings">
                <div class="settings-item logout-item">
                    <div class="settings-info"><h4>Salir de la cuenta</h4></div>
                    <button class="btn btn-secondary" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Salir</button>
                </div>
            </div>
        </div>
    </section>
</div>

<div class="modal" id="password-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Cambiar contraseña</h3>
            <button class="close-modal" id="close-password-modal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="password-form">
                <div class="form-group"><label>Actual</label><input type="password" required></div>
                <div class="form-group"><label>Nueva</label><input type="password" required></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancel-password-btn">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/backajustes.js') }}"></script>
@endpush
