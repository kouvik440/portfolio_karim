<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortfolioEntry extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['technologies' => 'array', 'is_published' => 'boolean', 'is_featured' => 'boolean', 'sort_order' => 'integer', 'gallery_paths' => 'array', 'occurred_on' => 'date:Y-m-d'];
    }

    public function publicData(): array
    {
        $data = $this->only(['id', 'type', 'title', 'organization', 'period', 'category', 'description', 'url', 'technologies', 'problem', 'solution', 'contribution', 'result', 'demo_url', 'cover_alt', 'is_featured']);
        $route = $this->type === 'news' ? 'news' : 'projects';
        $data['detail_url'] = in_array($this->type, ['project', 'news'], true) && $this->slug ? route($route.'.show', $this->slug) : null;
        $data['cover_url'] = $this->cover_path && $this->slug ? route($route.'.media', [$this->slug, 'cover']) : null;
        $data['gallery_urls'] = $this->slug ? array_map(fn ($index) => route($route.'.media', [$this->slug, 'gallery', $index]), array_keys($this->gallery_paths ?? [])) : [];
        if ($this->type === 'news') {
            $data['occurred_on'] = ($this->occurred_on ?? $this->created_at)?->format('Y-m-d');
        }

        return $data;
    }
}
