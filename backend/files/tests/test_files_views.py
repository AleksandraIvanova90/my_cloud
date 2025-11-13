
import pytest
import os
import logging
from django.urls import reverse
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from files.models import File

logger = logging.getLogger(__name__)

class TestFileListCreateView:

    def test_get_authenticated(self, authenticated_user, test_user, test_file):
        url = reverse('file-list-create')
        response = authenticated_user.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
        assert any(f['origin_name'] == 'test_file.txt' for f in response.data)

    def test_get_unauthenticated(self, api_client):
        url = reverse('file-list-create')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_authenticated(self, authenticated_user, test_user, test_file):
        url = reverse('file-list-create')
        response = authenticated_user.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1  
        assert any(f['origin_name'] == 'test_file.txt' for f in response.data['results']) 

    def test_post_authenticated_missing_file(self, authenticated_user):
        url = reverse('file-list-create')
        data = {'origin_name': 'missing_file.txt', 'comment': 'test comment'}
        response = authenticated_user.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST 

    def test_post_admin_for_other_user(self, authenticated_admin, test_user):
        url = reverse('file-list-create')
        file = SimpleUploadedFile("admin_file.txt", b"admin file content", content_type="text/plain")
        data = {'file': file, 'origin_name': 'admin_file.txt', 'comment': 'test comment', 'user_id': test_user.pk}
        response = authenticated_admin.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_201_CREATED
        assert File.objects.filter(user=test_user, origin_name='admin_file.txt').exists()

    def test_post_admin_invalid_user_id(self, authenticated_admin):
        url = reverse('file-list-create')
        file = SimpleUploadedFile("admin_file.txt", b"admin file content", content_type="text/plain")
        data = {'file': file, 'origin_name': 'admin_file.txt', 'comment': 'test comment', 'user_id': 999}
        response = authenticated_admin.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_post_authenticated_invalid_file_type(self, authenticated_user):
        url = reverse('file-list-create')
        file = SimpleUploadedFile("invalid_file.jpg", b"invalid content", content_type="image/jpeg")
        data = {'file': file, 'origin_name': 'invalid_file.jpg', 'comment': 'test comment'}
        response = authenticated_user.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_201_CREATED      


class TestFileDetailView:
    def test_get_authenticated_owner(self, authenticated_user, test_user, test_file):
        url = reverse('file-detail', args=[test_file.pk])
        response = authenticated_user.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['origin_name'] == 'test_file.txt'

    def test_get_authenticated_not_owner(self, authenticated_admin, test_file):
        url = reverse('file-detail', args=[test_file.pk])
        response = authenticated_admin.get(url)
        assert response.status_code == status.HTTP_200_OK  

    def test_update_authenticated_owner(self, authenticated_user, test_file):
        url = reverse('file-detail', args=[test_file.pk])
        data = {'comment': 'updated comment'}
        response = authenticated_user.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert File.objects.get(pk=test_file.pk).comment == 'updated comment'

    def test_delete_authenticated_owner(self, authenticated_user, test_file):
        url = reverse('file-detail', args=[test_file.pk])
        file_path = test_file.file.path
        response = authenticated_user.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not File.objects.filter(pk=test_file.pk).exists()
        assert not os.path.exists(file_path)

class TestFileDownloadView:
    def test_download_authenticated_owner(self, authenticated_user, test_file):
        url = reverse('file-download', args=[test_file.pk])
        response = authenticated_user.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Disposition'] == f'attachment; filename="{test_file.origin_name}"'

    def test_download_unauthenticated(self, api_client, test_file):
        url = reverse('file-download', args=[test_file.pk])
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

class TestSpecialLinkView:
    def test_download_via_link(self, api_client,authenticated_admin, test_file):
        url = reverse('generate-special-link', args=[test_file.pk])
        response = authenticated_admin.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'special_link' in response.data
        download_url = response.data['special_link']
        download_response = api_client.get(download_url)
        assert download_response.status_code == status.HTTP_200_OK
        assert download_response['Content-Disposition'] == f'attachment; filename="{test_file.origin_name}"'
