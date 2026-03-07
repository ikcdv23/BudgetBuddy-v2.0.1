<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;

    // Datos que permitimos guardar masivamente
    protected $fillable = [
        'user_id',
        'bank_name',
        'current_balance',
        'iban',
        'color',
    ];

    // Relación con el usuario
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relación con los movimientos
     * Una cuenta puede tener muchos movimientos
     */
    public function movements(): HasMany
    {
        return $this->hasMany(Movement::class);
    }

    /**
     * Relación con las tarjetas
     * Una cuenta puede tener muchas tarjetas
     */
    public function cards(): HasMany
    {
        return $this->hasMany(Card::class);
    }

    /**
     * Relación con los sobres (envelopes)
     * Una cuenta puede tener muchos sobres
     */
    public function envelopes(): HasMany
    {
        return $this->hasMany(Envelope::class);
    }

    // 2. ATRIBUTO VIRTUAL: 'spendable_balance'
    // Laravel convertirá esto en un campo JSON llamado "spendable_balance"
    protected $appends = ['spendable_balance'];

    public function getSpendableBalanceAttribute()
    {
        // Saldo Real - La suma de lo que has metido en los sobres
        $allocated = $this->envelopes->sum('allocated_amount');
        return $this->current_balance - $allocated;
    }
}
