from django.urls import path
from .views import FileList, FileDetail, download_file

urlpatterns = [

    path('', FileList.as_view(), name='file-list'),
    path('<int:pk>/', FileDetail.as_view(), name='file-detail'),
    path('download/', download_file, name='download_file'),
]