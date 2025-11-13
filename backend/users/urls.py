from django.urls import path
from users.views import UserList, UserDetail, RegisterView, LoginView, logout_view


urlpatterns = [
    path('users/', UserList.as_view(), name='user-list'),
    path('<int:pk>/', UserDetail.as_view(), name='user-detail'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
]