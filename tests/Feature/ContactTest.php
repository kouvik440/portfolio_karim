<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_valid_message_is_saved(): void
    {
        $payload = [
            'name' => 'Visiteur de test',
            'email' => 'visiteur@example.com',
            'subject' => 'Un site web',
            'message' => 'Bonjour, je souhaite discuter de la création de mon site web.',
            'website' => '',
        ];

        $this->postJson(route('contact.store'), $payload)
            ->assertCreated()
            ->assertJsonPath('message', 'Votre message a bien été enregistré. Merci pour votre intérêt !');

        unset($payload['website']);
        $this->assertDatabaseHas('contact_messages', $payload);
    }

    public function test_invalid_fields_are_rejected_without_saving(): void
    {
        $this->postJson(route('contact.store'), [
            'name' => '',
            'email' => 'invalid',
            'subject' => 'Sujet inconnu',
            'message' => 'Court',
        ])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);

        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_a_filled_honeypot_is_rejected(): void
    {
        $this->postJson(route('contact.store'), [
            'name' => 'Robot',
            'email' => 'robot@example.com',
            'subject' => 'Autre',
            'message' => 'Un message suffisamment long pour passer la validation.',
            'website' => 'https://spam.example',
        ])->assertUnprocessable()->assertJsonValidationErrors('website');

        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_contact_requests_are_rate_limited(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.99'])
                ->postJson(route('contact.store'), [])->assertUnprocessable();
        }

        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.99'])
            ->postJson(route('contact.store'), [])->assertStatus(429);
    }
}
