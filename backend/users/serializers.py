import os
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.core.validators import RegexValidator
from django.contrib.auth.hashers import make_password

from django.conf import settings

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'email', 'is_admin', 'storage_path')
        read_only_fields = ('id', 'storage_path', 'is_admin')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True,required=True, validators=[RegexValidator(
        regex=r'^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{6,}$',
        message='Пароль должен содержать не менее 6 символов, как минимум одну заглавную букву, одну цифру и один специальный символ.')
        ])
    username = serializers.CharField(
        validators=[RegexValidator(
            regex=r'^[a-zA-Z][a-zA-Z0-9]{3,19}$',
            message='Логин должен содержать только латинские буквы и цифры, первый символ - буква, длина от 4 до 20 символов.'
        )]
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'full_name', 'email')
    
    def create(self, validated_data):
        # validated_data['password']
        password = validated_data.pop('password', None)
        storage_path = f'user_files/{validated_data['username']}'
        validated_data['storage_path'] = storage_path
        user = User.objects.create(**validated_data) # Создаем пользователя с остальными данными

        if password:  # Если пароль был передан
            user.set_password(password) # Хешируем пароль и устанавливаем его пользователю
            user.save() # Сохраняем пользователя с захешированным паролем

        os.makedirs(os.path.join(settings.FILE_STORAGE_PATH,storage_path), exist_ok=True)

        return user
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        if username and password:
            user = authenticate(username=username, password=password)
            print(user)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('Аккаунт пользователя неактивен.')
                data['user'] = user
            else:
                raise serializers.ValidationError('Неправильный логин или пароль.')
        else:
            raise serializers.ValidationError('Необходимо указать логин и пароль.')

        return data


