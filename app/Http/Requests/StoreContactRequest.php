<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:254'],
            'subject' => ['required', 'string', 'in:Un site web,Une application,Une collaboration,Autre'],
            'message' => ['required', 'string', 'min:20', 'max:5000'],
            'website' => ['nullable', 'string', 'max:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Indiquez votre nom.',
            'name.max' => 'Le nom doit contenir au maximum 120 caractères.',
            'email.required' => 'Indiquez votre adresse e-mail.',
            'email.email' => 'Indiquez une adresse e-mail valide.',
            'subject.in' => 'Choisissez un sujet dans la liste.',
            'message.required' => 'Présentez votre projet en quelques mots.',
            'message.min' => 'Votre message doit contenir au moins 20 caractères.',
            'message.max' => 'Votre message doit contenir au maximum 5 000 caractères.',
            'website.max' => 'Le formulaire ne peut pas être envoyé.',
        ];
    }
}
