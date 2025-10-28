import os
import uuid
from django.db import models
from django.conf import settings

def generate_unique_filename(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4().hex}.{ext}'
    return os.path.join(instance.user.storage_path, filename)

class File(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    origin_name = models.CharField(max_length=255)
    file = models.FileField(upload_to=generate_unique_filename)
    comment = models.TextField(blank=True)
    size = models.PositiveIntegerField(default=0)
    upload_date = models.DateTimeField(auto_now_add=True)
    last_download_date = models.DateTimeField(null=True, blank=True)
    special_link = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    def __str__(self):
        return self.origin_name