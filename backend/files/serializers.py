from rest_framework import serializers
from .models import File
from django.conf import settings
from django.contrib.auth import get_user_model

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

class SpecialLinkSerializer(serializers.Serializer):
    """
    Сериализатор для создания специальных ссылок.
    """
    special_link = serializers.UUIDField(read_only=True)
