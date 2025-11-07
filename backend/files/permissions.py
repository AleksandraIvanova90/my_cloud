from rest_framework import permissions
from django.conf import settings

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Разрешает доступ только владельцу файла или администратору.
    """

    def has_object_permission(self, request, view, obj):
        # Администраторы имеют полный доступ
        if request.user.is_admin:
            return True

        # Владелец файла имеет доступ
        return obj.user == request.user


class CanListFiles(permissions.BasePermission):
    """
    Разрешает просмотр списка файлов только аутентифицированным пользователям.
    Администраторы могут просматривать файлы любого пользователя.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # obj это User
        if request.user.is_admin:
            if 'user_id' in request.query_params:
                return True
            return True
        # Только аутентифицированный пользователь может просматривать список своих файлов
        return obj == request.user


class CanDownloadViaLink(permissions.BasePermission):
    """
    Разрешает скачивание файла по специальной ссылке.
    """

    def has_permission(self, request, view):
        # Разрешаем всем, у кого есть ссылка
        return True
