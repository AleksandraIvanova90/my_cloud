from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model,logout
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .permissions import IsAdminUserOrReadOnly
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes as view_permission_classes
from django.utils import timezone
from django.conf import settings

User = get_user_model()

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self,request):
        serializer = self.serializer_class(data=request.data)
        print(serializer.is_valid)
        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data['user']
            token,created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@view_permission_classes([permissions.IsAuthenticated]) 
def logout_view(request):
    try:
        request.user.auth_token.delete()
        logout(request)
        return Response({'message': 'Вы успешно вышли из системы.'}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL.SERVER_ERROR)
