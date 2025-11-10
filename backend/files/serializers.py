from rest_framework import serializers
from .models import File
from django.urls import reverse
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured 

class FileSerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели File.
    """
    file = serializers.FileField(read_only=True)
    origin_name = serializers.CharField(read_only=True)
    user = serializers.ReadOnlyField(source='owner.username')
    class Meta:
        model = File
        fields = ['id', 'origin_name', 'file', 'comment', 'size', 'upload_date', 'last_download_date', 'special_link', 'user']
        read_only_fields = ['id', 'size', 'upload_date', 'last_download_date', 'special_link', 'user']
        

class FileUploadSerializer(serializers.Serializer):
    """
    Сериализатор для загрузки файлов.
    """
    file = serializers.FileField()
    origin_name = serializers.CharField(max_length=255)
    comment = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = File  
        fields = ['file', 'comment', 'origin_name']  
        extra_kwargs = {'origin_name': {'required': True}}  # Сделать поле обязательным

    def create(self, validated_data):
        print(validated_data)
        user = self.context['request'].user
        file = validated_data['file']
        origin_name = validated_data['origin_name']
        comment = validated_data['comment']
        size = file.size

        file_instance = File.objects.create(
            user=user,
            origin_name=origin_name,
            file=file,
            comment=comment,
            size=size
        )
        return file_instance


class FileUpdateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для обновления комментария к файлу.
    """
    class Meta:
        model = File
        fields = ['comment']

# class SpecialLinkSerializer(serializers.Serializer):
#     """
#     Сериализатор для создания специальных ссылок.
#     """
#     special_link = serializers.UUIDField(read_only=True)

class SpecialLinkSerializer(serializers.ModelSerializer):
    special_link = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['special_link']

    def get_special_link(self, obj):
        print("get_special_link is being called!")
        # use settings
        base_url = settings.SITE_URL  # Define SITE_URL
        print(base_url)
        if not base_url:
             raise ImproperlyConfigured("SITE_URL setting must be defined")
        # Build full url
        relative_url = reverse('download-via-link', kwargs={'special_link': obj.special_link})
        absolute_url = self.context['request'].build_absolute_uri(relative_url)
        return absolute_url