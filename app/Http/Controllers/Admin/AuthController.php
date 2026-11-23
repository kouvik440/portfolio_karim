<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'name.required' => 'Votre nom est requis.',
            'email.required' => 'L’adresse e-mail est requise.',
            'email.email' => 'Veuillez renseigner une adresse e-mail valide.',
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',
            'password.required' => 'Le mot de passe est requis.',
            'password.min' => 'Le mot de passe doit comporter au moins 8 caractères.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ]);

        $user = new User;
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->password = $validated['password'];
        $user->is_admin = true;
        $user->save();

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Compte administrateur créé avec succès.',
            'redirect' => route('admin.index'),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);

        if (! Auth::attempt([...$credentials, 'is_admin' => true])) {
            throw ValidationException::withMessages(['email' => 'Adresse e-mail ou mot de passe incorrect.']);
        }

        $request->session()->regenerate();

        return response()->json(['redirect' => route('admin.index')]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['redirect' => route('login')]);
    }
}
