<?php

namespace Tests\Feature;

use App\Models\PortfolioEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NewsPublicationTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create();
        $admin->forceFill(['is_admin' => true])->save();

        return $admin;
    }

    private function payload(array $extra = []): array
    {
        return [...['type' => 'news', 'title' => 'Rencontre professionnelle', 'description' => 'Un retour sur une expérience professionnelle et les échanges de la journée.', 'occurred_on' => '2026-10-31', 'sort_order' => 0, 'is_published' => false], ...$extra];
    }

    public function test_news_can_be_saved_as_draft_published_edited_and_deleted_with_its_photos(): void
    {
        Storage::fake('local');
        $this->actingAs($this->admin());
        $id = $this->post('/admin/elements', $this->payload([
            'cover' => UploadedFile::fake()->image('evenement.jpg'),
            'gallery' => [UploadedFile::fake()->image('rencontre.png')],
            'cover_alt' => 'Rencontre entre professionnels',
        ]), ['Accept' => 'application/json'])->assertCreated()->json('entry.id');
        $entry = PortfolioEntry::findOrFail($id);
        Storage::disk('local')->assertExists([$entry->cover_path, ...$entry->gallery_paths]);
        $this->get('/actualites')->assertOk()->assertDontSee($entry->title);
        $this->get('/actualites/'.$entry->slug)->assertNotFound();
        $this->get('/actualites/'.$entry->slug.'/media/cover')->assertNotFound();
        $this->get('/admin/elements/'.$id.'/media/cover')->assertOk();
        $this->putJson('/admin/elements/'.$id, $this->payload(['is_published' => true]))->assertOk();
        $this->get('/actualites')->assertOk()->assertSee($entry->title)->assertDontSee($entry->cover_path);
        $this->get('/actualites/'.$entry->slug)->assertOk()->assertSee('BlogPosting')->assertSee('Rencontre entre professionnels');
        $this->get('/actualites/'.$entry->slug.'/media/cover')->assertOk();
        $this->get('/actualites/'.$entry->slug.'/media/gallery/0')->assertOk();
        $this->get('/projets/'.$entry->slug)->assertNotFound();
        $this->get('/projets/'.$entry->slug.'/media/cover')->assertNotFound();
        $this->get('/sitemap.xml')->assertSee('/actualites/'.$entry->slug, false);
        $this->putJson('/admin/elements/'.$id, $this->payload(['title' => 'Récit actualisé', 'is_published' => true, 'remove_cover' => true, 'remove_gallery' => true]))->assertOk();
        Storage::disk('local')->assertMissing([$entry->cover_path, ...$entry->gallery_paths]);
        $this->get('/actualites')->assertSee('Récit actualisé');
        $this->deleteJson('/admin/elements/'.$id)->assertOk();
        $this->get('/actualites/'.$entry->slug)->assertNotFound();
    }

    public function test_news_are_paginated_by_date_and_drafts_never_appear(): void
    {
        for ($day = 1; $day <= 12; $day++) {
            PortfolioEntry::create($this->payload(['title' => 'Publication '.$day, 'slug' => 'publication-'.$day, 'occurred_on' => sprintf('2026-10-%02d', $day), 'is_published' => true]));
        }
        PortfolioEntry::create($this->payload(['slug' => 'secret', 'title' => 'Brouillon confidentiel']));
        $response = $this->get('/actualites')->assertOk()->assertDontSee('Brouillon confidentiel');
        $posts = $response->viewData('portfolio')['news_page']['posts'];
        $this->assertCount(10, $posts);
        $this->assertSame('Publication 12', $posts[0]['title']);
        $this->assertSame('Publication 3', $posts[9]['title']);
        $this->assertCount(2, $this->get('/actualites?page=2')->assertOk()->viewData('portfolio')['news_page']['posts']);
        $this->get('/')->assertDontSee('Brouillon confidentiel');
    }

    public function test_news_validation_and_administrator_access_are_enforced(): void
    {
        $this->postJson('/admin/elements', $this->payload())->assertUnauthorized();
        $this->actingAs(User::factory()->create())->postJson('/admin/elements', $this->payload())->assertForbidden();
        $this->actingAs($this->admin())->postJson('/admin/elements', $this->payload(['description' => '', 'occurred_on' => 'not-a-date']))->assertUnprocessable()->assertJsonValidationErrors(['description', 'occurred_on']);
        $this->post('/admin/elements', $this->payload(['cover' => UploadedFile::fake()->createWithContent('script.php', '<?php echo 1;')->mimeType('text/x-php')]), ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('cover');
        $this->postJson('/admin/elements', $this->payload(['url' => 'javascript:alert(1)']))->assertUnprocessable()->assertJsonValidationErrors('url');
        $this->assertDatabaseCount('portfolio_entries', 0);
    }

    public function test_news_text_cannot_inject_markup_and_projects_cannot_be_read_as_news(): void
    {
        $post = PortfolioEntry::create($this->payload(['slug' => 'texte', 'description' => '<script>alert(1)</script>', 'is_published' => true]));
        $this->get('/actualites/'.$post->slug)->assertOk()->assertDontSee('<script>alert(1)</script>', false);
        $project = PortfolioEntry::create($this->payload(['type' => 'project', 'slug' => 'projet', 'is_published' => true]));
        $this->get('/actualites/'.$project->slug)->assertNotFound();
        $this->actingAs($this->admin())->putJson('/admin/elements/'.$project->id, $this->payload())->assertUnprocessable()->assertJsonValidationErrors('type');

    }
}
