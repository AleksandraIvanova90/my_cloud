import os

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import File
from .serializers import FileSerializer
from .permissions import IsOwnerOrAdmin
from django.http import FileResponse, HttpResponse, Http404
from django.utils import timezone
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
import mimetypes
import logging

logger = logging.getLogger(__name__)

class FileList(generics.ListCreateAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            user_id = self.request.query_params.get('user_id', None)
            if user_id:
                return File.objects.filter(user_id=user_id)
            else:
                return File.object.all()
        return File.objects.filter(user=user)
    
    def perform_create(self, serializer):
        user = self.request.user
        file_obj = self.request.FILES.get('file')
        if file_obj:
            serializer.save(
                user=user,
                original_name=file_obj.name,
                file=file_obj,
                size=file_obj.size
            )
        else:
            serializer.save(user=user)

class FileDetail(generics.RetrieveUpdateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes=[permissions.IsAuthenticated, IsOwnerOrAdmin]
    parser_classes = (MultiPartParser, FormParser)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def download_file(request, special_link):
    try:
        file = File.objects.get(special_link=special_link)
    except File.DoesNotExist:
        logger.warning(f'Попытка доступа к несуществующему файлу по ссылке: {special_link}')
        raise Http404('Файл не найден.')
    file_path = file.file.path
    if os.path.exists(file_path):
        file.last_download_date = timezone.now()
        file.save()
        mime_type, _ = mimetypes.guess_type(file_path)
        if mime_type is None:
            mime_type = 'application/octet-stream'
        try:
            with open(file_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type=mime_type)
                response['Content-Disposition'] = f'attachment;filename="{file.origin_name}"'
                response['Cjntent-Length'] = os.path.getsize(file_path)
                logger.info(f'файл скачанЖ {file.origin_name}, размер: {file.size} байт')
                return response
        except Exception as e:
            logger.error(f'Ошибка при открытии фыйлаЖ {file_path}, ошибка: {str(e)}')
            return HttpResponse(status=500)
    else:
        logger.error(f'Файл не найден на дискеЖ {file_path}')
        raise Http404('Файл не найден на диске.')

