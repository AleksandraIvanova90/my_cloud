import pytest
import os
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from files.models import File

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user(db):
    return User.objects.create_user(username='testuser', password='testpassword')

@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(username='adminuser', password='adminpassword', email='admin@example.com')

@pytest.fixture
def authenticated_user(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client

@pytest.fixture
def authenticated_admin(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client

@pytest.fixture
def test_file(db, test_user):
    file = SimpleUploadedFile("test_file.txt", b"file content", content_type="text/plain")
    return File.objects.create(user=test_user, origin_name="test_file.txt", file=file, size=len(b"file content"))

@pytest.fixture
def authenticated_user(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client

@pytest.fixture
def authenticated_admin(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client
