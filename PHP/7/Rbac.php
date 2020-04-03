<?php

class Rbac
{
    /**
     * Check user access to module
     *
     * @param int $role
     * @param string $object
     * @param string|null $action
     * @return bool
     */
    public static function hasAccess(int $role, string $object, ?string $action = ''): bool
    {
        if($rules = (new Collection('rbac'))->get([
            'where'  => "collection.object = '{$object}' AND collection.action = '{$action}'",
            'enable' => true
        ])) {
            $allowedRoles = array_column($rules, 'role');
            return in_array($role, $allowedRoles) || !reset($allowedRoles);
        }
        return false;
    }
}