import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

@pytest.mark.django_db
def test_user_list_unauthenticated(api_client):
    url = reverse('user-list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_user_list_authenticated(authenticated_client):
    url = reverse('user-list')
    response = authenticated_client.get(url)
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_user_detail_unauthenticated(api_client, regular_user):
    url = reverse('user-detail', args=[regular_user.pk])
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_user_detail_authenticated(authenticated_client, regular_user):
    url = reverse('user-detail', args=[regular_user.pk])
    response = authenticated_client.get(url)
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_user_detail_admin(authenticated_admin_client, regular_user):
     url = reverse('user-detail', args=[regular_user.pk])
     response = authenticated_admin_client.get(url)
     assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_user_update_unauthenticated(api_client, regular_user):
    url = reverse('user-detail', args=[regular_user.pk])
    data = {'fullname': 'Updated Name'}
    response = api_client.patch(url, data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_user_update_authenticated_not_admin(authenticated_client, regular_user):
    url = reverse('user-detail', args=[regular_user.pk])
    data = {'fullname': 'Updated Name'}
    response = authenticated_client.patch(url, data)
    assert response.status_code == status.HTTP_403_FORBIDDEN 

@pytest.mark.django_db
def test_user_update_authenticated_admin(authenticated_admin_client, regular_user):
    url = reverse('user-detail', args=[regular_user.pk])
    data = {'fullname': 'Updated Name'}
    response = authenticated_admin_client.patch(url, data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['fullname'] == 'Updated Name'

@pytest.mark.django_db
def test_user_delete_unauthenticated(api_client, regular_user):
    url = reverse('user-detail', args=[regular_user.pk])
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_user_delete_authenticated_not_admin(authenticated_client, regular_user):
    url = reverse('user-detail', args=[regular_user.pk])
    response = authenticated_client.delete(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN 

@pytest.mark.django_db
def test_user_delete_authenticated_admin(authenticated_admin_client, regular_user):
    url = reverse('user-detail', args=[regular_user.pk])
    response = authenticated_admin_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT

@pytest.mark.django_db
def test_register_view(api_client):
    url = reverse('register')
    data = {
        'username': 'newuser',
        'password': 'Password123!',
        'email': 'new@example.com',
        'fullname': 'New User'
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert get_user_model().objects.filter(username='newuser').exists()

@pytest.mark.django_db
def test_login_view(api_client, create_user):
    create_user(username='loginuser', password='Password123!', email='login@example.com')
    url = reverse('login')
    data = {'username': 'loginuser', 'password': 'Password123!'}
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_200_OK
    assert 'token' in response.data

@pytest.mark.django_db
def test_logout_view(authenticated_client):
    url = reverse('logout')
    user = get_user_model().objects.get(username='testuser')
    token, created = Token.objects.get_or_create(user=user) 
    response = authenticated_client.post(url)
    assert response.status_code == status.HTTP_200_OK
    assert 'message' in response.data
    assert not authenticated_client.credentials()