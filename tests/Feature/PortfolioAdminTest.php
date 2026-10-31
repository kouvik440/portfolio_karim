<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\PortfolioEntry;
use App\Models\PortfolioProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PortfolioAdminTest extends TestCase
{
    use RefreshDatabase;

    private function administrator(): User
    {
        $user = User::factory()->create();
        $user->forceFill(['is_admin' => true])->save();

        return $user;
    }

    public function test_administration_and_private_messages_require_an_administrator(): void
    {
        $this->get('/admin')->assertRedirect(route('login'));
        $this->getJson('/admin/data')->assertUnauthorized();
        $this->getJson('/admin/messages')->assertUnauthorized();
        $this->postJson('/admin/elements', [])->assertUnauthorized();
        $this->actingAs(User::factory()->create())->getJson('/admin/data')->assertForbidden();
    }

    public function test_only_an_administrator_can_log_in_and_can_log_out(): void
    {
        $admin = $this->administrator();
        $this->postJson('/admin/connexion', ['email' => $admin->email, 'password' => 'password'])
            ->assertOk()->assertJsonPath('redirect', route('admin.index'));
        $this->assertAuthenticatedAs($admin);
        $this->get('/admin')->assertOk();
        $this->getJson('/admin/data')->assertOk();
        $this->postJson('/admin/deconnexion')->assertOk();
        $this->assertGuest();
        $ordinaryUser = User::factory()->create();
        $this->postJson('/admin/connexion', ['email' => $ordinaryUser->email, 'password' => 'password'])->assertUnprocessable();
        $this->assertGuest();
    }

    public static function entryTypes(): array
    {
        return array_map(fn ($type) => [$type], ['education', 'experience', 'skill', 'interest', 'language', 'project']);
    }

    #[DataProvider('entryTypes')]
    public function test_each_section_can_be_created_updated_hidden_and_deleted(string $type): void
    {
        $this->actingAs($this->administrator());
        $payload = ['type' => $type, 'title' => 'Contenu de vérification', 'description' => 'Description complète', 'sort_order' => 2, 'is_published' => true, 'technologies' => ['Laravel']];
        $id = $this->postJson('/admin/elements', $payload)->assertCreated()->json('entry.id');
        $this->assertDatabaseHas('portfolio_entries', ['id' => $id, 'type' => $type]);
        $this->get('/')->assertSee('Contenu de v', false);
        $payload['title'] = 'Contenu masqué';
        $payload['is_published'] = false;
        $this->putJson('/admin/elements/'.$id, $payload)->assertOk();
        $this->get('/')->assertDontSee('Contenu masqu', false);
        $this->deleteJson('/admin/elements/'.$id)->assertOk();
        $this->assertDatabaseMissing('portfolio_entries', ['id' => $id]);
    }

    public function test_invalid_entry_and_unsafe_url_are_rejected(): void
    {
        $this->actingAs($this->administrator())->postJson('/admin/elements', [
            'type' => 'admin', 'title' => '', 'url' => 'javascript:alert(1)', 'sort_order' => -1, 'is_published' => true,
        ])->assertUnprocessable()->assertJsonValidationErrors(['type', 'title', 'url', 'sort_order']);
        $this->assertDatabaseCount('portfolio_entries', 0);
    }

    public function test_profile_and_cv_upload_are_saved_and_downloadable(): void
    {
        Storage::fake('local');
        $this->actingAs($this->administrator());
        $this->post('/admin/profil', [
            'full_name' => 'Karim OUEDRAOGO', 'display_name' => 'Karim', 'job_title' => 'Développeur',
            'email' => 'contact@example.com', 'cv' => UploadedFile::fake()->createWithContent('cv.pdf', "%PDF-1.4\nCV de test"),
        ], ['Accept' => 'application/json'])->assertOk();
        $profile = PortfolioProfile::findOrFail(1);
        Storage::disk('local')->assertExists($profile->cv_path);
        $this->get('/portfolio/media/cv')->assertOk()->assertDownload('CV-Karim-Ouedraogo.pdf');
        $this->postJson('/admin/profil', [
            'full_name' => $profile->full_name, 'display_name' => 'Karim', 'job_title' => 'Développeur', 'remove_cv' => true,
        ])->assertOk();
        Storage::disk('local')->assertMissing($profile->cv_path);
        $this->get('/portfolio/media/cv')->assertNotFound();
    }

    public function test_invalid_upload_cannot_replace_existing_cv(): void
    {
        Storage::fake('local');
        PortfolioProfile::create(['full_name' => 'Karim', 'cv_path' => 'portfolio/original.pdf']);
        Storage::disk('local')->put('portfolio/original.pdf', '%PDF-1.4');
        $this->actingAs($this->administrator())->post('/admin/profil', [
            'full_name' => 'Karim', 'display_name' => 'Karim', 'job_title' => 'Développeur',
            'cv' => UploadedFile::fake()->createWithContent('bad.pdf', '<?php echo 1;')->mimeType('text/x-php'),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('cv');
        Storage::disk('local')->assertExists('portfolio/original.pdf');
    }

    public function test_private_messages_are_visible_only_in_admin(): void
    {
        ContactMessage::create(['name' => 'Visiteur', 'email' => 'private@example.com', 'subject' => 'Autre', 'message' => 'Un contenu privé envoyé depuis le formulaire.']);
        $this->get('/')->assertDontSee('private@example.com');
        $this->actingAs($this->administrator())->getJson('/admin/messages')->assertOk()->assertJsonPath('data.0.email', 'private@example.com');
    }

    public function test_import_is_idempotent_and_preserves_manual_edits(): void
    {
        $this->artisan('portfolio:import-cv')->assertSuccessful();
        $count = PortfolioEntry::count();
        PortfolioProfile::findOrFail(1)->update(['bio' => 'Biographie modifiée']);
        $this->artisan('portfolio:import-cv')->assertSuccessful();
        $this->assertDatabaseCount('portfolio_entries', $count);
        $this->assertDatabaseHas('portfolio_profiles', ['bio' => 'Biographie modifiée']);
    }

    public function test_administrator_creation_requires_confirmed_password(): void
    {
        $this->artisan('portfolio:admin')
            ->expectsQuestion('Nom de l’administrateur', 'Karim')
            ->expectsQuestion('Adresse e-mail de connexion', 'admin@example.com')
            ->expectsQuestion('Mot de passe (12 caractères minimum)', 'Test-secret-2026')
            ->expectsQuestion('Confirmez le mot de passe', 'Test-secret-2026')
            ->assertSuccessful();

        $this->assertTrue(User::where('email', 'admin@example.com')->firstOrFail()->is_admin);
    }
}
