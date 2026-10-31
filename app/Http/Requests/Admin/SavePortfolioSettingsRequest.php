<?php

namespace App\Http\Requests\Admin;

use App\Models\PortfolioProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SavePortfolioSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return [
            'meta_title' => ['nullable', 'string', 'max:120'],
            'meta_description' => ['nullable', 'string', 'max:320'],
            'default_theme' => ['required', Rule::in(['system', 'dark', 'light'])],
            'content' => ['required', 'array:'.implode(',', array_keys(PortfolioProfile::CONTENT_DEFAULTS))],
            'content.*' => ['nullable', 'string', 'max:2000'],
            'content.hero_cta' => ['nullable', 'string', 'max:60'],
        ];
    }
}
