<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SavePortfolioProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'display_name' => ['required', 'string', 'max:60'],
            'job_title' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:10000'],
            'availability' => ['nullable', 'string', 'max:180'],
            'email' => ['nullable', 'email', 'max:254'],
            'phone' => ['nullable', 'string', 'max:60'],
            'location' => ['nullable', 'string', 'max:255'],
            'github_url' => ['nullable', 'url:http,https', 'max:2048'],
            'linkedin_url' => ['nullable', 'url:http,https', 'max:2048'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240', 'dimensions:max_width=8192,max_height=8192'],
            'cv' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'remove_photo' => ['nullable', 'boolean'],
            'remove_cv' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'photo.max' => 'La photo de profil ne doit pas dépasser 10 Mo.',
            'photo.image' => 'Le fichier doit être une image valide.',
            'cv.max' => 'Le CV ne doit pas dépasser 10 Mo.',
            'cv.mimes' => 'Le CV doit être au format PDF.',
        ];
    }
}
