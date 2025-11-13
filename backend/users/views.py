import logging
import os
import shutil 
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model,logout
from django.http import Http404
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .permissions import IsAdminUserOrReadOnly

from rest_framework.decorators import api_view, permission_classes as view_permission_classes
from django.utils import timezone
from django.conf import settings


logger = logging.getLogger('users')

User = get_user_model()

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        logger.debug(f"Попытка получения списка пользователей пользователем: {request.user.username}")
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            logger.info(f"Пользователь {request.user.username} успешно получил список пользователей.")
            logger.debug(f"Список пользователей: {serializer.data}") 
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Ошибка при получении списка пользователей пользователем {request.user.username}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUserOrReadOnly]

    def retrieve(self, request, *args, **kwargs):
        logger.debug(f"Попытка получения информации о пользователе {kwargs['pk']} пользователем {request.user.username}") 
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            logger.info(f"Пользователь {request.user.username} успешно получил информацию о пользователе {instance.username}.")
            print(serializer.data)
            logger.debug(f"Информация о пользователе {instance.username}: {serializer.data}") 
            return Response(serializer.data) 
        except Exception as e:
            logger.error(f"Ошибка при получении информации о пользователе {kwargs['pk']} пользователем {request.user.username}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        logger.debug(f"Попытка обновления информации о пользователе {kwargs['pk']} пользователем {request.user.username}")
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Пользователь {request.user.username} успешно обновил информацию о пользователе {instance.username}.")
                logger.debug(f"Обновленная информация о пользователе {instance.username}: {serializer.data}")
                return Response(serializer.data)
            else:
                logger.warning(f"Ошибка валидации при обновлении пользователя {instance.username} пользователем {request.user.username}: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Http404:
            logger.warning(f"Пользователь с id {kwargs['pk']} не найден при попытке обновления пользователем {request.user.username}.")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Ошибка при обновлении пользователя {kwargs['pk']} пользователем {request.user.username}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        logger.debug(f"Попытка удаления пользователя {kwargs['pk']} пользователем {request.user.username}")
        try:
            instance = self.get_object()
            storage_path = instance.storage_path 
            instance.delete()
            logger.info(f"Пользователь {request.user.username} успешно удалил пользователя {instance.username}.")
            if storage_path:
                full_path = os.path.join(settings.MEDIA_ROOT, storage_path)
                try:
                    shutil.rmtree(full_path)
                    logger.info(f"Удалена папка пользователя: {full_path}")
                except Exception as e:
                    logger.error(f"Ошибка при удалении папки пользователя {full_path}: {e}")

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Ошибка при удалении пользователя {kwargs['pk']} пользователем {request.user.username}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
      logger.debug(f"Попытка регистрации нового пользователя: {request.data.get('username')}")
      try:
          response = super().create(request, *args, **kwargs)
          logger.info(f"Новый пользователь успешно зарегистрирован: {request.data.get('username')}")
          return response
      except Exception as e:
          logger.error(f"Ошибка при регистрации пользователя {request.data.get('username')}: {e}")
          return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        logger.debug(f"Попытка входа пользователя")
        try:
            serializer = self.serializer_class(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            logger.info(f"Пользователь {user.username} успешно вошел в систему.")
            logger.debug(f"Токен пользователя: {token.key}")
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.warning(f"Ошибка при входе пользователя: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@view_permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    logger.debug(f"Попытка выхода пользователя: {request.user.username}")
    try:
        if request.user.auth_token:
            request.user.auth_token.delete()
        logout(request)
        logger.info(f"Пользователь {request.user.username} успешно вышел из системы.")
        return Response({'message': 'Вы успешно вышли из системы.'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Ошибка при выходе пользователя {request.user.username}: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
