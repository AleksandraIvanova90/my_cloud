import pytest
from users.serializers import UserSerializer, RegisterSerializer, LoginSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

@pytest.mark.django_db
def test_user_serializer(regular_user, test_file): 
    serializer = UserSerializer(regular_user)
    data = serializer.data

    assert data['username'] == regular_user.username
    assert data['email'] == regular_user.email
    assert data['is_staff'] == regular_user.is_staff
    assert data['file_count'] == 1  
    assert data['total_size'] == test_file.file.size 
    assert data['storage_path'] == regular_user.storage_path

@pytest.mark.django_db
def test_register_serializer_valid(db): 
    data = {
        'username': 'newuser',
        'password': 'Password123!',
        'email': 'newuser@example.com',
        'fullname': 'New User'
    }
    serializer = RegisterSerializer(data=data)
    assert serializer.is_valid()

@pytest.mark.django_db
def test_register_serializer_invalid_username(db):
    data = {
        'username': 'invalid-username',
        'password': 'Password123!',
        'email': 'newuser@example.com',
        'fullname': 'New User'
    }
    serializer = RegisterSerializer(data=data)
    assert not serializer.is_valid()
    assert 'username' in serializer.errors

@pytest.mark.django_db
def test_register_serializer_invalid_password(db):
    data = {
        'username': 'validuser',
        'password': 'weak',
        'email': 'newuser@example.com',
        'fullname': 'New User'
    }
    serializer = RegisterSerializer(data=data)
    assert not serializer.is_valid()
    assert 'password' in serializer.errors

@pytest.mark.django_db
def test_register_serializer_create(db): 
    data = {
        'username': 'newuser2',
        'password': 'Password123!',
        'email': 'newuser2@example.com',
        'fullname': 'New User'
    }
    serializer = RegisterSerializer(data=data)
    serializer.is_valid()
    user = serializer.save()

    assert user.username == 'newuser2'
    assert user.email == 'newuser2@example.com'
    assert user.check_password('Password123!') 
    assert user.storage_path == 'user_files/newuser2'

@pytest.mark.django_db
def test_login_serializer_valid(create_user):
    user = create_user(username='testlogin', password='Password123!', email='testlogin@example.com')
    data = {'username': 'testlogin', 'password': 'Password123!'}
    serializer = LoginSerializer(data=data)
    assert serializer.is_valid()

@pytest.mark.django_db
def test_login_serializer_invalid_credentials():
    data = {'username': 'wronguser', 'password': 'wrongpassword'}
    serializer = LoginSerializer(data=data)
    assert not serializer.is_valid()
    assert 'non_field_errors' in serializer.errors 

@pytest.mark.django_db
def test_login_serializer_validate(create_user):
    user = create_user(username='testlogin2', password='Password123!', email='testlogin2@example.com')
    data = {'username': 'testlogin2', 'password': 'Password123!'}
    serializer = LoginSerializer(data=data)
    serializer.is_valid()
    validated_data = serializer.validate(data)
    assert validated_data['user'] == user