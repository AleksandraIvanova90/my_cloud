import pytest
from django.contrib.auth import get_user_model

@pytest.mark.django_db
def test_user_creation(create_user):
    user = create_user(username='testuser', password='password123', email='test@example.com', fullname='Test User')
    assert user.username == 'testuser'
    assert user.fullname == 'Test User'
    assert user.email == 'test@example.com'
    assert not user.is_staff
    assert user.storage_path == 'user_files/testuser' 
    assert str(user) == 'testuser' 
    assert user.check_password('password123')

@pytest.mark.django_db
def test_admin_user_creation(create_superuser):
    admin_user = create_superuser(username='admin', password='adminpassword', email='admin@example.com')
    assert admin_user.is_staff

@pytest.mark.django_db
def test_user_storage_path(create_user):
    user = create_user(username='customuser')
    assert user.storage_path == 'user_files/customuser'

@pytest.mark.django_db
def test_user_default_values(create_user):
    user = create_user(username='defaults')
    assert user.fullname == ''
    assert not user.is_staff