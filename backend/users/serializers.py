import logging

from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.core.validators import RegexValidator


from django.conf import settings
from django.db import IntegrityError
from files.models import File

logger = logging.getLogger('users')

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    file_count = serializers.SerializerMethodField()
    total_size = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'fullname', 'email', 'is_staff', 'storage_path', 'file_count', 'total_size')
        read_only_fields = ('id', 'storage_path', 'file_count', 'total_size', 'username')
        partial=True
       

    def get_file_count(self, obj):
        """Возвращает количество файлов, принадлежащих пользователю."""
        logger.debug(f"Получение file_count для пользователя: {obj.username}") 
        try:
            count = File.objects.filter(user=obj).count()
            logger.debug(f"file_count для пользователя {obj.username}: {count}")  # DEBUG
            return count
        except Exception as e:
            logger.error(f"Ошибка при получении file_count для пользователя {obj.username}: {e}")
            return None  

    def get_total_size(self, obj):
        """Возвращает общий размер файлов пользователя в байтах."""
        logger.debug(f"Получение total_size для пользователя: {obj.username}") 
        try:
            files = File.objects.filter(user=obj) 
            total_size = sum(file.file.size for file in files)
            logger.debug(f"total_size для пользователя {obj.username}: {total_size}")  
            return total_size
        except Exception as e:
            logger.error(f"Ошибка при получении total_size для пользователя {obj.username}: {e}")
            return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True,required=True, validators=[
        RegexValidator(
            regex=r'^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{6,}$',
            message='Пароль должен содержать не менее 6 символов, как минимум одну заглавную букву, одну цифру и один специальный символ.')
        ])
    username = serializers.CharField(
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z][a-zA-Z0-9]{3,19}$',
                message='Логин должен содержать только латинские буквы и цифры, первый символ - буква, длина от 4 до 20 символов.'
        )]
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'fullname', 'email')
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        storage_path = f'user_files/{validated_data['username']}'
        validated_data['storage_path'] = storage_path
        try:
            user = User.objects.create(**validated_data) 
            logger.info(f"Создан новый пользователь: {user.username}")
        except IntegrityError as e:
            logger.warning(f"Попытка регистрации пользователя с существующим логином: {validated_data['username']}, ошибка: {e}")
            raise serializers.ValidationError({'username': ['Пользователь с таким логином уже существует.']})

        if password:  
            user.set_password(password)
            user.save()
            logger.debug(f"Пароль установлен для пользователя: {user.username}")

        return user
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    logger.warning(f"Попытка входа неактивного пользователя: {username}")
                    raise serializers.ValidationError('Аккаунт пользователя неактивен.')
                data['user'] = user
                logger.info(f"Пользователь успешно аутентифицирован: {username}") 
            else:
                logger.warning(f"Неудачная попытка входа: неверный логин или пароль для пользователя: {username}")
                raise serializers.ValidationError('Неправильный логин или пароль.')
        else:
            logger.warning("Попытка входа без указания логина или пароля.")
            raise serializers.ValidationError('Необходимо указать логин и пароль.')

        return data


