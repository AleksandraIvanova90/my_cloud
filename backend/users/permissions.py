from rest_framework import permissions


class IsAdminUserOrReadOnly(permissions.BasePermission):

# Разрешает полный доступ администраторам, остальным - только чтение. 

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
    