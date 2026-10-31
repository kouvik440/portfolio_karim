<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\PortfolioEntry;
use App\Models\PortfolioProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PremiumPortfolioTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->forceFill(['is_admin' => true])->save();

        return $user;
    }

    private function payload(array $extra = []): array
    {
        return [...['type' => 'project', 'title' => 'Projet réel', 'description' => 'Une application utile', 'sort_order' => 0, 'is_published' => false], ...$extra];
    }

    public function test_project_images_and_case_studies_follow_publication_and_are_cleaned_up(): void
    {
        Storage::fake('local');
        $this->actingAs($this->admin());
        $id = $this->post('/admin/elements', $this->payload([
            'cover' => UploadedFile::fake()->image('capture.png'),
            'gallery' => [UploadedFile::fake()->image('detail.png')],
            'problem' => 'Le besoin réel', 'solution' => 'La solution réalisée',
            'technologies' => '["Laravel","React"]',
        ]), ['Accept' => 'application/json'])->assertCreated()->json('entry.id');
        $entry = PortfolioEntry::findOrFail($id);
        Storage::disk('local')->assertExists([$entry->cover_path, ...$entry->gallery_paths]);
        $this->get('/projets/'.$entry->slug)->assertNotFound();
        $this->get('/projets/'.$entry->slug.'/media/cover')->assertNotFound();
        $this->get('/admin/elements/'.$id.'/media/cover')->assertOk();
        $this->putJson('/admin/elements/'.$id, $this->payload(['is_published' => true]))->assertOk();
        $this->get('/projets/'.$entry->slug)->assertOk()->assertSee('Le besoin réel')->assertSee('rel="canonical"', false);
        $this->get('/projets/'.$entry->slug.'/media/cover')->assertOk();
        $this->get('/projets/'.$entry->slug.'/media/gallery/0')->assertOk();
        $this->get('/projets/'.$entry->slug.'/media/gallery/99')->assertNotFound();
        $this->get('/')->assertDontSee($entry->cover_path);
        $this->deleteJson('/admin/elements/'.$id)->assertOk();
        Storage::disk('local')->assertMissing([$entry->cover_path, ...$entry->gallery_paths]);
    }

    public function test_settings_are_validated_and_content_is_escaped_in_public_markup(): void
    {
        $this->actingAs($this->admin());
        $settings = ['default_theme' => 'light', 'meta_title' => 'Karim — Portfolio', 'meta_description' => 'Applications web', 'content' => [...PortfolioProfile::CONTENT_DEFAULTS, 'work_heading' => '<script>alert(1)</script>']];
        $this->postJson('/admin/parametres', $settings)->assertOk();
        $this->get('/')->assertOk()->assertSee('Karim — Portfolio')->assertDontSee('<script>alert(1)</script>', false);
        $this->assertSame('light', PortfolioProfile::find(1)->default_theme);
        $this->postJson('/admin/parametres', [...$settings, 'default_theme' => 'invalid'])->assertUnprocessable()->assertJsonValidationErrors('default_theme');
    }

    public function test_inbox_read_state_and_delete_require_admin_and_update_counts(): void
    {
        $message = ContactMessage::create(['name' => 'Visiteur', 'email' => 'test@example.com', 'subject' => 'Projet', 'message' => 'Une demande de projet']);
        $this->patchJson('/admin/messages/'.$message->id)->assertUnauthorized();
        $this->actingAs(User::factory()->create())->deleteJson('/admin/messages/'.$message->id)->assertForbidden();
        $this->actingAs($this->admin())->getJson('/admin/data')->assertJsonPath('stats.unread_messages', 1);
        $this->patchJson('/admin/messages/'.$message->id)->assertOk();
        $this->getJson('/admin/data')->assertJsonPath('stats.unread_messages', 0);
        $this->patchJson('/admin/messages/'.$message->id)->assertOk();
        $this->getJson('/admin/data')->assertJsonPath('stats.unread_messages', 1);
        $this->deleteJson('/admin/messages/'.$message->id)->assertOk();
        $this->assertDatabaseMissing('contact_messages', ['id' => $message->id]);
    }

    public function test_sitemap_excludes_drafts_and_invalid_slugs_or_media_are_rejected(): void
    {
        $this->actingAs($this->admin());
        $this->postJson('/admin/elements', $this->payload(['slug' => 'published', 'is_published' => true]))->assertCreated();
        $this->postJson('/admin/elements', $this->payload(['slug' => 'draft']))->assertCreated();
        $this->get('/sitemap.xml')->assertOk()->assertSee('/projets/published', false)->assertDontSee('/projets/draft', false);
        $this->get('/robots.txt')->assertOk()->assertSee('Disallow: /admin')->assertSee('/sitemap.xml');
        $this->postJson('/admin/elements', $this->payload(['slug' => 'published']))->assertUnprocessable()->assertJsonValidationErrors('slug');
        $this->postJson('/admin/elements', $this->payload(['demo_url' => 'javascript:alert(1)']))->assertUnprocessable()->assertJsonValidationErrors('demo_url');
        $this->post('/admin/elements', $this->payload(['cover' => UploadedFile::fake()->createWithContent('script.php', '<?php echo 1;')->mimeType('text/x-php')]), ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('cover');
    }
}
