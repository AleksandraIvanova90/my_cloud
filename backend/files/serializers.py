from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    file = serializers.FileField(read_only=True)

    class Meta:
        model = File
        fields = ('id', 'original_name', 'file', 'comment', 'size', 'upload_date', 'last_download_date', 'special_link')
        read_only_fields = ('id', 'size', 'upload_date', 'last_download_date', 'special_link')
        