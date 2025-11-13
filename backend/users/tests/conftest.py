import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from users.models import User
from files.models import File
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
import os, shutil

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user_model():
    return get_user_model()

@pytest.fixture
def create_user(user_model):
    def make_user(**kwargs):
         if 'storage_path' not in kwargs:
            username = kwargs.get('username', 'default_user')
            kwargs['storage_path'] = f'user_files/{username}'

         return User.objects.create_user(**kwargs)
    return make_user

@pytest.fixture
def create_superuser(user_model):
    def make_superuser(**kwargs):
        return user_model.objects.create_superuser(**kwargs)
    return make_superuser

@pytest.fixture
def admin_user(create_superuser):
    return create_superuser(username='admin', password='password123', email='admin@example.com')

@pytest.fixture
def regular_user(create_user):
    return create_user(username='testuser', password='password123', email='test@example.com')

@pytest.fixture
def authenticated_client(api_client, regular_user):
    api_client.force_authenticate(user=regular_user)
    return api_client

@pytest.fixture
def authenticated_admin_client(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client

@pytest.fixture
def test_file(regular_user):
    file_content = b"This is a test file content."
    uploaded_file = SimpleUploadedFile("test_file.txt", file_content)
    file = File.objects.create(user=regular_user, file=uploaded_file, origin_name="test_file.txt")

    yield file  

  
    file_path = file.file.path

    if os.path.exists(file_path):
        os.remove(file_path) 

   
    directory_path = os.path.dirname(file_path)
    if not os.listdir(directory_path):
        os.rmdir(directory_path)

    file.delete()

@pytest.fixture(scope="session", autouse=True)
def setup_and_teardown_media():

    if not os.path.exists(settings.TESTING_MEDIA_ROOT):
        os.makedirs(settings.TESTING_MEDIA_ROOT)

    yield

    if os.path.exists(settings.TESTING_MEDIA_ROOT):
        shutil.rmtree(settings.TESTING_MEDIA_ROOT)