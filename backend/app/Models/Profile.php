<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    // Estos son los campos que se ven en tu imagen image_3f0e16.png
    protected $fillable = [
        'user_id',
        'lastname',
        'phone_country_code',
        'phone',
        'avatar',
        'currency'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}