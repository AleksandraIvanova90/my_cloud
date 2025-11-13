from rest_framework import permissions
from django.conf import settings

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Разрешает доступ только владельцу файла или администратору.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.user == request.user


class CanListFiles(permissions.BasePermission):
    """
    Разрешает просмотр списка файлов только аутентифицированным пользователям.
    Администраторы могут просматривать файлы любого пользователя.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            if 'user_id' in request.query_params:
                return True
            return True
        return obj == request.user


class CanDownloadViaLink(permissions.BasePermission):
    """
    Разрешает скачивание файла по специальной ссылке.
    """

    def has_permission(self, request, view):
        return True
