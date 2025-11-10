import os
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404

from django.conf import settings
from django.utils import timezone
from .models import File
from .serializers import FileSerializer, FileUploadSerializer, FileUpdateSerializer, SpecialLinkSerializer
from .permissions import IsOwnerOrAdmin, CanListFiles, CanDownloadViaLink
from django.contrib.auth import get_user_model
from urllib.parse import quote 



class FileListCreateView(generics.ListCreateAPIView):
    """
    Представление для получения списка файлов и загрузки новых файлов.
    """
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated, CanListFiles]

    def get_queryset(self):
        user = self.request.user

        if user.is_admin and self.request.query_params.get('user_id'):
            user_id = self.request.query_params.get('user_id')
            User = get_user_model()
            target_user = get_object_or_404(User, pk=user_id)
            self.check_object_permissions(self.request, target_user)
            return File.objects.filter(user=target_user)
        else:
            return File.objects.filter(user=user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FileUploadSerializer
        return FileSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_permissions(self):
        """
        Получение прав доступа для запроса.
        """
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated(), CanListFiles()]
        return [permissions.IsAuthenticated()]


class FileDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Представление для получения, обновления и удаления конкретного файла.
    """
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    
    def delete(self, request, *args, **kwargs):
        response = self.destroy(request, *args, **kwargs)
        return response


    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE',]:
            return FileUpdateSerializer
        return FileSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsOwnerOrAdmin])
def file_download(request, pk):
    """
    Представление для скачивания файла.
    """
    file = get_object_or_404(File, pk=pk)
    file_path = file.file.path

    if os.path.exists(file_path):
        file.last_download_date = timezone.now()
        file.save()
        response = FileResponse(open(file_path, 'rb'))
        response['Content-Disposition'] = f'attachment; filename="{quote(file.origin_name)}"'
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return response
    else:
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)


class FileRenameView(generics.UpdateAPIView):
    """
    Представление для переименования файла.
    """
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    http_method_names = ['patch']  # Разрешаем только метод PATCH

    def patch(self, request, *args, **kwargs):
        file = self.get_object()
        new_name = request.data.get('origin_name')

        if not new_name:
            return Response({'error': 'origin_name is required'}, status=status.HTTP_400_BAD_REQUEST)

        file.origin_name = new_name
        file.save()
        serializer = self.get_serializer(file)
        return Response(serializer.data)


class GenerateSpecialLinkView(generics.RetrieveAPIView):
    """
    Представление для формирования специальной ссылки на файл.
    """
    queryset = File.objects.all()
    serializer_class = SpecialLinkSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = SpecialLinkSerializer(instance, context={'request': request})
        return Response({'special_link': serializer.data['special_link']}) 


@api_view(['GET'])
@permission_classes([CanDownloadViaLink])
def download_via_link(request, special_link):
    """
    Представление для скачивания файла по специальной ссылке.
    """
    file = get_object_or_404(File, special_link=special_link)
    file_path = file.file.path

    if os.path.exists(file_path):
        file.last_download_date = timezone.now()
        file.save()

        response = FileResponse(open(file_path, 'rb'))
        response['Content-Disposition'] = f'attachment; filename="{quote(file.origin_name)}"'
       
        return response
    else:
        return Http404()
