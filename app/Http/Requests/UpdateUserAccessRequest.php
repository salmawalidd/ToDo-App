<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserAccessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(
            'manage roles and permissions'
        ) ?? false;
    }

    public function rules(): array
    {
        return [
            'roles' => [
                'required',
                'array',
                'min:1',
            ],
            'roles.*' => [
                'required',
                'string',
                'exists:roles,name',
            ],
            'permissions' => [
                'present',
                'array',
            ],
            'permissions.*' => [
                'required',
                'string',
                'exists:permissions,name',
            ],
        ];
    }
}
