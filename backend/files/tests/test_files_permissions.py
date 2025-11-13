import pytest
from django.contrib.auth import get_user_model
from files.models import File
from files.permissions import IsOwnerOrAdmin, CanListFiles
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework.test import APIRequestFactory

User = get_user_model()

@pytest.fixture
def request_factory():
    return APIRequestFactory()

def test_is_owner_or_admin_owner(test_user, test_file, request_factory):
    from files.permissions import IsOwnerOrAdmin
    permission = IsOwnerOrAdmin()
    request = request_factory.get('/')
    request.user = test_user

    assert permission.has_object_permission(request, APIView(), test_file)

def test_is_owner_or_admin_admin(admin_user, test_file, request_factory):
    from files.permissions import IsOwnerOrAdmin
    permission = IsOwnerOrAdmin()
    request = request_factory.get('/')
    request.user = admin_user

    assert permission.has_object_permission(request, APIView(), test_file)

def test_is_owner_or_admin_not_owner_not_admin(test_user, admin_user, test_file, request_factory):
    not_owner = User.objects.create_user(username='notowner', password='testpassword')

    from files.permissions import IsOwnerOrAdmin
    permission = IsOwnerOrAdmin()
    request = request_factory.get('/')
    request.user = not_owner

    assert not permission.has_object_permission(request, APIView(), test_file)

def test_can_list_files_authenticated(test_user, request_factory):
    from files.permissions import CanListFiles
    permission = CanListFiles()
    request = request_factory.get('/')
    request.user = test_user
    assert permission.has_permission(request, APIView())

def test_can_list_files_admin(admin_user, test_user, request_factory):
    from files.permissions import CanListFiles
    permission = CanListFiles()
    request = request_factory.get('/?user_id=' + str(test_user.id))
    request.user = admin_user
    assert permission.has_permission(request, APIView())
