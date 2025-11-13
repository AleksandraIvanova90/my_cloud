import logging
from rest_framework import serializers
from .models import File
from django.urls import reverse
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured 

logger = logging.getLogger('files')

class FileSerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели File.
    """
    file = serializers.FileField(read_only=True)
    origin_name = serializers.CharField(read_only=True)
    user = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = File
        fields = ['id', 'origin_name', 'file', 'comment', 'size', 'upload_date', 'last_download_date', 'special_link', 'user', 'user_id']
        read_only_fields = ['id', 'size', 'upload_date', 'last_download_date', 'special_link']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        logger.debug(f"Сериализация объекта File (ID: {instance.id}) для отображения: {representation}")
        return representation

class FileUploadSerializer(serializers.Serializer):
    """
    Сериализатор для загрузки файлов.
    """
    file = serializers.FileField()
    origin_name = serializers.CharField(max_length=255)
    comment = serializers.CharField(required=False, allow_blank=True)
    user_id = serializers.IntegerField(required=False, allow_null=True) 
   
    class Meta:
        model = File  
        fields = ['file', 'comment', 'origin_name', 'user_id'] 
        extra_kwargs = {'origin_name': {'required': True}}  
    
    def validate(self, data):
        """
        Проверяет входные данные перед созданием файла.
        """
        logger.debug(f"Валидация данных для загрузки файла: {data}")
        return data

   
    def create(self, validated_data):
        logger.debug(f"Создание нового файла с данными: {validated_data}")
        request = self.context['request']
        user = request.user
        if user.is_staff and 'user_id' in validated_data and validated_data['user_id'] is not None:
            target_user_id = validated_data.pop('user_id')
            target_user = get_user_model().objects.get(pk=target_user_id)
            logger.info(f"Администратор {user.username} создает файл для пользователя {target_user.username}")
        else:
            target_user = user 
            logger.info(f"Пользователь {user.username} создает файл для себя.")


        file = validated_data['file']
        origin_name = validated_data['origin_name']
        comment = validated_data['comment']
        size = file.size

        try:
            file_instance = File.objects.create(
                user=target_user,
                origin_name=origin_name,
                file=file,
                comment=comment,
                size=size
            )
            logger.info(f"Файл ID:{file_instance.pk} успешно создан.")
            return file_instance
        except Exception as e:
            logger.error(f"Ошибка при создании файла: {e}")
            raise


class FileUpdateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для обновления комментария к файлу.
    """
    class Meta:
        model = File
        fields = ['comment']
    
    def update(self, instance, validated_data):
        logger.debug(f"Обновление комментария к файлу ID:{instance.pk} с данными: {validated_data}")
        instance.comment = validated_data.get('comment', instance.comment)
        instance.save()
        logger.info(f"Комментарий к файлу ID:{instance.pk} успешно обновлен.")
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        logger.debug(f"Сериализация обновленного объекта File (ID: {instance.id}) для отображения: {representation}")
        return representation


class SpecialLinkSerializer(serializers.ModelSerializer):
    special_link = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['special_link']

    def get_special_link(self, obj):
        logger.debug(f"Генерация специальной ссылки для файла ID:{obj.pk}")
        base_url = settings.SITE_URL  
        logger.debug(f"Базовый URL из настроек: {base_url}")
        if not base_url:
             logger.error("SITE_URL setting must be defined in settings.py")
             raise ImproperlyConfigured("SITE_URL setting must be defined")
        relative_url = reverse('download-via-link', kwargs={'special_link': obj.special_link})
        absolute_url = self.context['request'].build_absolute_uri(relative_url)
        logger.info(f"Специальная ссылка для файла ID:{obj.pk} успешно сгенерирована: {absolute_url}")
        return absolute_url