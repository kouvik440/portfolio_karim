<?php

namespace App\Http\Requests\Admin;

use App\Http\Controllers\Admin\PortfolioController;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SavePortfolioEntryRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('technologies'))) {
            $technologies = json_decode($this->input('technologies'), true);
            if (is_array($technologies)) {
                $this->merge(['technologies' => $technologies]);
            }
        }

        if ($this->input('type') === 'news' && ! $this->filled('occurred_on')) {
            $this->merge(['occurred_on' => today()->toDateString()]);
        }

        if (! $this->has('sort_order') || $this->input('sort_order') === null || $this->input('sort_order') === '') {
            $this->merge(['sort_order' => 0]);
        }
    }

    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in($this->route('entry') ? [$this->route('entry')->type] : PortfolioController::TYPES)],
            'title' => ['required', 'string', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'period' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:120'],
            'description' => ['required_if:type,news', 'nullable', 'string', 'max:10000'],
            'occurred_on' => ['exclude_unless:type,news', 'nullable', 'date_format:Y-m-d'],
            'url' => ['nullable', 'url:http,https', 'max:2048'],
            'technologies' => ['nullable', 'array', 'max:30'],
            'technologies.*' => ['string', 'max:80'],
            'sort_order' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:10000'],
            'is_published' => ['required', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'slug' => ['exclude_unless:type,project,news', 'nullable', 'string', 'max:180', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('portfolio_entries', 'slug')->ignore($this->route('entry')?->id)],
            'problem' => ['exclude_unless:type,project', 'nullable', 'string', 'max:10000'],
            'solution' => ['exclude_unless:type,project', 'nullable', 'string', 'max:10000'],
            'contribution' => ['exclude_unless:type,project', 'nullable', 'string', 'max:10000'],
            'result' => ['exclude_unless:type,project', 'nullable', 'string', 'max:10000'],
            'demo_url' => ['exclude_unless:type,project', 'nullable', 'url:http,https', 'max:2048'],
            'cover_alt' => ['exclude_unless:type,project,news', 'nullable', 'string', 'max:255'],
            'cover' => ['exclude_unless:type,project,news', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240', 'dimensions:max_width=8192,max_height=8192'],
            'remove_cover' => ['exclude_unless:type,project,news', 'sometimes', 'boolean'],
            'gallery' => ['exclude_unless:type,project,news', 'nullable', 'array', 'max:3'],
            'gallery.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:10240', 'dimensions:max_width=8192,max_height=8192'],
            'remove_gallery' => ['exclude_unless:type,project,news', 'sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'cover.max' => 'La photo de couverture ne doit pas dépasser 10 Mo.',
            'cover.image' => 'Le fichier doit être une image valide.',
            'cover.mimes' => 'Le format de la couverture doit être JPG, PNG ou WebP.',
            'cover.dimensions' => 'Les dimensions de l’image sont trop grandes (maximum 8192x8192 px).',
            'gallery.*.max' => 'Chaque photo de la galerie ne doit pas dépasser 10 Mo.',
            'gallery.*.image' => 'Chaque fichier de galerie doit être une image valide.',
            'gallery.*.mimes' => 'Les photos de la galerie doivent être au format JPG, PNG ou WebP.',
        ];
    }
}
