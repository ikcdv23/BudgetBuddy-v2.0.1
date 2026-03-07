<header class="desktop-header">
    <div class="desktop-brand">
        <img src="{{ asset('images/logo_budget_expand.png') }}" alt="Logo BudgetBuddy" />
    </div>
    <div class="desktop-header-right">
        <div class="user-profile-top">
            <div class="user-avatar-top" title="Mi perfil">
                @php
                    $parts = explode(' ', Auth::user()->name);
                    $initials = strtoupper(substr($parts[0], 0, 1));
                    if (count($parts) > 1) $initials .= strtoupper(substr(end($parts), 0, 1));
                @endphp
                {{ $initials }}
            </div>
        </div>
    </div>
</header>
