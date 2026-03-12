<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'alias',
        'last_4_digits',
        'card_number',
        'security_code',
        'expiration_date',
        'type'
    ];

    protected $hidden = [
        'card_number',
        'security_code',
    ];

    protected $casts = [
        'card_number'   => 'encrypted',
        'security_code' => 'encrypted',
    ];

    protected $appends = [
        'has_full_number',
        'has_security_code',
    ];

    public function getHasFullNumberAttribute(): bool
    {
        return !empty($this->card_number);
    }

    public function getHasSecurityCodeAttribute(): bool
    {
        return !empty($this->security_code);
    }

    // Relación con la cuenta
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Relación con los movimientos
     * Una tarjeta puede tener muchos movimientos
     * Movimientos realizados con esta tarjeta
     */
    public function movements(): HasMany
    {
        return $this->hasMany(Movement::class);
    }
}
