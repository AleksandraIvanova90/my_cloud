import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from files.models import File
from files.serializers import FileSerializer, FileUploadSerializer, FileUpdateSerializer

def test_file_serializer(test_file):
    serializer = FileSerializer(test_file)
    assert serializer.data['origin_name'] == 'test_file.txt'
    assert serializer.data['size'] == len(b"file content")

def test_file_upload_serializer_valid():
    file = SimpleUploadedFile("upload_file.txt", b"upload file content", content_type="text/plain")
    data = {'file': file, 'origin_name': 'upload_file.txt', 'comment': 'upload test comment'}
    serializer = FileUploadSerializer(data=data)
    assert serializer.is_valid()

def test_file_upload_serializer_invalid_missing_origin_name():
    file = SimpleUploadedFile("upload_file.txt", b"upload file content", content_type="text/plain")
    data = {'file': file, 'comment': 'upload test comment'}
    serializer = FileUploadSerializer(data=data)
    assert not serializer.is_valid()
    assert 'origin_name' in serializer.errors

def test_file_update_serializer_valid(test_file):
    data = {'comment': 'updated comment'}
    serializer = FileUpdateSerializer(test_file, data=data, partial=True)
    assert serializer.is_valid()
    serializer.save()
    assert File.objects.get(pk=test_file.pk).comment == 'updated comment'
