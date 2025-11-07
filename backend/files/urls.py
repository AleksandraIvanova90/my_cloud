# from django.urls import path
# from .views import FileList, FileDetail, download_file

# urlpatterns = [

#     path('list/', FileList.as_view(), name='file-list'),
#     path('<int:pk>/', FileDetail.as_view(), name='file-detail'),
#     path('download/<uuid:special_link>/', download_file, name='download_file'),
# ]

from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.FileListCreateView.as_view(), name='file-list-create'),
    path('<int:pk>/', views.FileDetailView.as_view(), name='file-detail'),
    path('<int:pk>/download/', views.file_download, name='file-download'),
    path('<int:pk>/rename/', views.FileRenameView.as_view(), name='file-rename'),
    path('<int:pk>/special_link/', views.GenerateSpecialLinkView.as_view(), name='generate-special-link'),
    path('download/<uuid:special_link>/', views.download_via_link, name='download-via-link'), # Скачивание по специальной ссылке
]
