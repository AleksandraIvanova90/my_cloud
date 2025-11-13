import os
import logging
from rest_framework import generics, permissions, status, serializers
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

logger = logging.getLogger('files')

class FileListCreateView(generics.ListCreateAPIView):
    """
    Представление для получения списка файлов и загрузки новых файлов.
    """
    queryset = File.objects.all().order_by('-upload_date') 
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated, CanListFiles]

    def get_queryset(self):
        user = self.request.user
        logger.debug(f'Пользователь {user.username} обращается к списку файлов.') 

        if user.is_staff and self.request.query_params.get('user_id'):
            user_id = self.request.query_params.get('user_id')
            User = get_user_model()
            target_user = get_object_or_404(User, pk=user_id)
            self.check_object_permissions(self.request, target_user)
            logger.info(f'Admin {user.username} получает список файлов для пользователя {target_user.username}')
            return File.objects.filter(user=target_user)
        else:
            logger.info(f'Пользователь {user.username} получает список своих собственных файлов') 
            return File.objects.filter(user=user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FileUploadSerializer
        return FileSerializer

    def perform_create(self, serializer):
        request = self.request
        if request.user.is_staff and request.data.get('user_id'):
            try:
                user_id = int(request.data['user_id'])
                target_user = get_user_model().objects.get(pk=user_id)
                serializer.save(user=target_user)
                logger.info(f'Админ {request.user.username} загрузил файл для пользователя {target_user.username}.')
            except (ValueError, get_user_model().DoesNotExist):
                logger.warning(f'Админ {request.user.username} указал неверный user_id.')
                raise serializers.ValidationError("Неверный user_id.")
        else:
            serializer.save(user=request.user)
            logger.info(f'Пользователь {request.user.username} загрузил новый файл.')

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

    def retrieve(self, request, *args, **kwargs):
       instance = self.get_object()  
       serializer = self.get_serializer(instance)
       logger.debug(f'Пользователь {request.user.username} извлек файл {instance.pk}.')
       return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object() 
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f'Пользователь {request.user.username} обновил файл {instance.pk}')
            return Response(serializer.data)
        logger.warning(f'Пользователю {request.user.username} не удалось обновить файл {instance.pk }: {serializer.errors}')
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object() 
        file_path = instance.file.path
        try:
            os.remove(file_path)
            logger.info(f'Пользователь {request.user.username} удалил файл {instance.pk} и путь к нему {file_path}')
        except Exception as e:
            logger.error(f'Ошибка при удалении файла {instance.pk } по пути {file_path}: {e}')

        response = super().destroy(request, *args, **kwargs) 
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
    try:
        file = get_object_or_404(File, pk=pk)
        file_path = file.file.path

        if os.path.exists(file_path):
            file.last_download_date = timezone.now()
            file.save()
            logger.info(f'UПользователь {request.user.username} скачал файл {file.pk}') 
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Disposition'] = f'attachment; filename="{quote(file.origin_name)}"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
            return response
        else:
            logger.error(f'Файл не найден на диске: {file.pk } по адресу {file_path}')
            return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)
        
    except permissions.exceptions.PermissionDenied: 
        logger.warning(f'Пользователь {request.user.username} попытался загрузить файл {pk} без разрешения.')
        return Response({'error': 'В разрешении отказано'}, status=status.HTTP_403_FORBIDDEN)

    except Exception as e:
        logger.exception(f'Непредвиденная ошибка при загрузке файла {pk}: {e}')
        return Response({'error': 'Внутренняя ошибка сервера'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FileRenameView(generics.UpdateAPIView):
    """
    Представление для переименования файла.
    """
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    http_method_names = ['patch']  

    def patch(self, request, *args, **kwargs):
        try:
            file = self.get_object()
            new_name = request.data.get('origin_name')

            if not new_name:
                logger.warning(f'Пользователь {request.user.username} попытался переименовать файл {file.pk} без указания нового имени.')
                return Response({'error': 'Требуется указать origin_name'}, status=status.HTTP_400_BAD_REQUEST)

            file.origin_name = new_name
            file.save()
            serializer = self.get_serializer(file)
            return Response(serializer.data)
        
        except permissions.exceptions.PermissionDenied:
            logger.warning(f'Пользователь {request.user.username} попытался переименовать файл без разрешения.')
            return Response({'error': 'В разрешении отказано'}, status=status.HTTP_403_FORBIDDEN)

        except Exception as e:
            logger.exception(f'Ошибка при переименовании файла: {e}')
            return Response({'error': 'Внутренняя ошибка сервера'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateSpecialLinkView(generics.RetrieveAPIView):
    """
    Представление для формирования специальной ссылки на файл.
    """
    queryset = File.objects.all()
    serializer_class = SpecialLinkSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = SpecialLinkSerializer(instance, context={'request': request})
            logger.info(f'Пользователь {request.user.username} сгенерировал специальную ссылку для файла {instance.pk}')
            return Response({'special_link': serializer.data['special_link']}) 
        
        except permissions.exceptions.PermissionDenied:
            logger.warning(f'Пользователь {request.user.username} попытался сгенерировать специальную ссылку без разрешения.')
            return Response({'error': 'В разрешении отказано'}, status=status.HTTP_403_FORBIDDEN)

        except Exception as e:
            logger.exception(f"Error generating special link: {e}")
            return Response({'error': 'Внутренняя ошибка сервера'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([CanDownloadViaLink])
def download_via_link(request, special_link):
    """
    Представление для скачивания файла по специальной ссылке.
    """
    try:
        file = get_object_or_404(File, special_link=special_link)
        file_path = file.file.path

        if os.path.exists(file_path):
            file.last_download_date = timezone.now()
            file.save()
            logger.info(f'FФайл {file.pk} загружен по специальной ссылке')

            response = FileResponse(open(file_path, 'rb'))
            response['Content-Disposition'] = f'attachment; filename="{quote(file.origin_name)}"'
        
            return response
        else:
            logger.error(f'Файл не найден на диске(по специальной ссылке): {file.pk} по адресу {file_path}')
            return Http404()
    except Exception as e:
        logger.exception(f"Ошибка при загрузке файла по специальной ссылке: {e}")
        return Response({'error': 'Внутренняя ошибка сервера'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
