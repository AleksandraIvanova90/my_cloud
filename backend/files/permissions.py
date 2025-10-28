from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):

    # Разрешает доступ только владельцу файла или администратору
    def has_object_permissions(seif, request, obj):
        if request.users.is_admin:
            return True
        return obj.user == request.user

