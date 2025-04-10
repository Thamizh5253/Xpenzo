from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from .models import UserProfile
from .serializers import UserProfileSerializer

from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache
import uuid

# Generate JWT tokens manually
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

# Register API
@api_view(["POST"])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Login API
# @api_view(["POST"])
# def login_user(request):
#     username = request.data.get("username")
#     password = request.data.get("password")
#     user = authenticate(request, username=username, password=password)

#     if user is not None:
#         tokens = get_tokens_for_user(user)
#         return Response(tokens, status=status.HTTP_200_OK)
#     return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(["POST"])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)

    if user is not None:
        tokens = get_tokens_for_user(user)

        # Check if the user has a profile
        profile_exists = UserProfile.objects.filter(user=user).exists()

        response_data = {
            "tokens": tokens,
            "profile_exists": profile_exists,
            "message": "Login successful" if profile_exists else "Profile incomplete — please fill in your details.",
        }

        return Response(response_data, status=status.HTTP_200_OK)

    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# Protected API
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "This is a protected view"}, status=status.HTTP_200_OK)



# Create or Update Profile
@api_view(["POST", "PUT"])
@permission_classes([IsAuthenticated])
def create_or_update_profile(request):
    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Fetch User Profile
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    try:

        profile = UserProfile.objects.get(user=request.user)
        print(profile)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)



@api_view(["POST"])
def forgot_password(request):
    
    email = request.data.get('email')

    try:
        user = User.objects.get(email=email)
        token = str(uuid.uuid4())

        # Store token in cache for 30 minutes (1800 seconds)
        cache.set(f'password_reset_{token}', user.username, timeout=1800)

        reset_link = f"http://localhost:5173/reset-password?token={token}"

        send_mail(
            'Reset Your Password',
            f'Click the link to reset your password: {reset_link}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return Response({'message': 'Password reset email sent.'})

    except User.DoesNotExist:
        return Response({'error': 'Email not found.'}, status=404)

@api_view(["POST"])
def reset_password(request):
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    # print(token ,  new_password)

    # all_cache_data = cache._cache  # This is a dict-like object
    # print(all_cache_data)

    username = cache.get(f'password_reset_{token}')
    if not username:
        return Response({'error': 'Invalid or expired token.'}, status=400)

    try:
        
        user = User.objects.get(username=username)
        user.set_password(new_password)
        user.save()

        # Optionally delete token from cache
        cache.delete(f'password_reset_{token}')

        return Response({'message': 'Password has been reset successfully.'})

    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)
