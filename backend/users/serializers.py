import os
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.core.validators import RegexValidator


from django.conf import settings
from django.db import IntegrityError

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'fullname', 'email', 'is_admin', 'storage_path')
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
        fields = ('username', 'password', 'fullname', 'email')
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        storage_path = f'user_files/{validated_data['username']}'
        validated_data['storage_path'] = storage_path
        try:
            user = User.objects.create(**validated_data) 
        except IntegrityError:
            raise serializers.ValidationError({'username': ['Пользователь с таким логином уже существует.']})

        if password:  
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


