<header class="desktop-header">
    <div class="desktop-brand">
        <img src="{{ asset('images/logo_budget_expand.png') }}" alt="Logo BudgetBuddy" />
    </div>
    <div class="desktop-header-right">
        <div class="user-profile-top">
            @php
                $avatar = Auth::user()->profile?->avatar;
                $parts = explode(' ', Auth::user()->name);
                $initials = strtoupper(substr($parts[0], 0, 1));
                if (count($parts) > 1) $initials .= strtoupper(substr(end($parts), 0, 1));

                $presetIcons = [
                    'preset-1' => 'fa-graduation-cap',
                    'preset-2' => 'fa-piggy-bank',
                    'preset-3' => 'fa-chart-line',
                    'preset-4' => 'fa-rocket',
                    'preset-5' => 'fa-lightbulb',
                    'preset-6' => 'fa-star',
                    'preset-7' => 'fa-bullseye',
                    'preset-8' => 'fa-flask',
                ];
                $presetGradients = [
                    'preset-1' => 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    'preset-2' => 'linear-gradient(135deg, #ec4899, #be185d)',
                    'preset-3' => 'linear-gradient(135deg, #10b981, #047857)',
                    'preset-4' => 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    'preset-5' => 'linear-gradient(135deg, #f59e0b, #d97706)',
                    'preset-6' => 'linear-gradient(135deg, #f97316, #ea580c)',
                    'preset-7' => 'linear-gradient(135deg, #14b8a6, #0d9488)',
                    'preset-8' => 'linear-gradient(135deg, #6366f1, #4338ca)',
                ];
            @endphp
            @if($avatar && isset($presetIcons[$avatar]))
                <div class="user-avatar-top avatar-preset" id="header-avatar-btn" data-preset="{{ $avatar }}" title="Mi perfil" style="background: {{ $presetGradients[$avatar] }};">
                    <i class="fas {{ $presetIcons[$avatar] }}" style="color:white;font-size:16px;"></i>
                </div>
            @elseif($avatar)
                <div class="user-avatar-top avatar-photo" id="header-avatar-btn" title="Mi perfil">
                    <img src="{{ asset('storage/' . $avatar) }}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
                </div>
            @else
                <div class="user-avatar-top" id="header-avatar-btn" title="Mi perfil">{{ $initials }}</div>
            @endif

            <!-- Dropdown menú -->
            <div class="avatar-dropdown" id="avatar-dropdown">
                <a href="/ajustes" class="avatar-dropdown-item">
                    <i class="fas fa-cog"></i> Ajustes
                </a>
                <div class="avatar-dropdown-divider"></div>
                <button class="avatar-dropdown-item avatar-dropdown-logout" id="header-logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Cerrar sesión
                </button>
            </div>
        </div>
    </div>
</header>
