<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();

        $permissions = [
            'view todos',
            'create todos',
            'update todos',
            'delete todos',
            'manage users',
             'delete users',
        ];

        foreach ($permissions as $permissionName) {
            Permission::updateOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);
        }

        $userRole = Role::updateOrCreate([
            'name' => 'user',
            'guard_name' => 'web',
        ]);

        $adminRole = Role::updateOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);

        $userRole->syncPermissions([
            'view todos',
            'create todos',
            'update todos',
            'delete todos',
        ]);

        $adminRole->syncPermissions($permissions);

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();
    }
}
