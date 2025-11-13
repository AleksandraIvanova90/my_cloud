
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    fullname = models.CharField(max_length=255, blank=True, default='')
    storage_path = models.CharField(max_length=255, blank=True, default='user_files/<username>')

    def save(self, *args, **kwargs):
        if '<username>' in self.storage_path:
            self.storage_path = self.storage_path.replace('<username>', self.username)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
    


