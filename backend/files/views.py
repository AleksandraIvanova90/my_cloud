# import os

# from rest_framework import generics, permissions, status
# from rest_framework.response import Response
# from rest_framework.parsers import MultiPartParser, FormParser
# from django.shortcuts import get_object_or_404
# from .models import File
# from .serializers import FileSerializer
# from .permissions import IsOwnerOrAdmin
# from django.http import FileResponse, HttpResponse, Http404
# from django.utils import timezone
# from django.conf import settings
# from rest_framework.decorators import api_view, permission_classes
# import mimetypes
# import logging

# logger = logging.getLogger(__name__)

# class FileList(generics.ListCreateAPIView):
#     serializer_class = FileSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     parser_classes = (MultiPartParser, FormParser)

#     def get_queryset(self):
#         user = self.request.user
#         if user.is_admin:
#             user_id = self.request.query_params.get('user_id', None)
#             if user_id:
#                 return File.objects.filter(user_id=user_id)
#             else:
#                 return File.object.all()
#         return File.objects.filter(user=user)
    
#     def get_serializer_context(self):
#         return {'request': self.request}
    
#     # def perform_create(self, serializer):
#     #     user = self.request.user
#     #     file_obj = self.request.FILES.get('file')
#     #     if file_obj:
#     #         serializer.save(
#     #             user=user,
#     #             original_name=file_obj.name,
#     #             file=file_obj,
#     #             size=file_obj.size
#     #         )
#     #     else:
#     #         serializer.save(user=user)

# class FileDetail(generics.RetrieveUpdateAPIView):
#     queryset = File.objects.all()
#     serializer_class = FileSerializer
#     permission_classes=[permissions.IsAuthenticated, IsOwnerOrAdmin]
#     # parser_classes = (MultiPartParser, FormParser)

#     def put(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['GET'])
# @permission_classes([permissions.AllowAny])
# def download_file(request, special_link):
#     try:
#         file = File.objects.get(special_link=special_link)
#     except File.DoesNotExist:
#         logger.warning(f'Попытка доступа к несуществующему файлу по ссылке: {special_link}')
#         raise Http404('Файл не найден.')
#     file_path = file.file.path
#     if os.path.exists(file_path):
#         file.last_download_date = timezone.now()
#         file.save()
#         mime_type, _ = mimetypes.guess_type(file_path)
#         if mime_type is None:
#             mime_type = 'application/octet-stream'
#         try:
#             with open(file_path, 'rb') as f:
#                 response = HttpResponse(f.read(), content_type=mime_type)
#                 response['Content-Disposition'] = f'attachment;filename="{file.origin_name}"'
#                 response['Cjntent-Length'] = os.path.getsize(file_path)
#                 logger.info(f'файл скачан: {file.origin_name}, размер: {file.size} байт')
#                 return response
#         except Exception as e:
#             logger.error(f'Ошибка при открытии фыйла: {file_path}, ошибка: {str(e)}')
#             return HttpResponse(status=500)
#     else:
#         logger.error(f'Файл не найден на диске: {file_path}')
#         raise Http404('Файл не найден на диске.')

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
from urllib.parse import quote # ИМПОРТИРОВАТЬ quote



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
        serializer = SpecialLinkSerializer(instance)
        return Response({'special_link': instance.special_link})


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
