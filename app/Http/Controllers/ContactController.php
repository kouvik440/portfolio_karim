<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreContactRequest $request): JsonResponse
    {
        ContactMessage::create($request->safe()->only(['name', 'email', 'subject', 'message']));

        return response()->json(['message' => 'Votre message a bien été enregistré. Merci pour votre intérêt !'], 201);
    }
}
