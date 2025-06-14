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
from .tasks import send_password_reset_email
from django.core.cache import cache
import uuid

from django.http import JsonResponse
from rest_framework_simplejwt.exceptions import TokenError
import json
from django.views.decorators.csrf import csrf_exempt

# views.py
from .serializers import UserMiniSerializer

from decouple import config

from .tokens import get_tokens_for_user


# Register API
@api_view(["POST"])
def register_user(request):
    # Check if user with email already exists
    email = request.data.get('email')
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "User with this email already exists"}, 
            status=status.HTTP_409_CONFLICT
        )
    
    # Check if username already exists
    username = request.data.get('username')
    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already taken"}, 
            status=status.HTTP_409_CONFLICT
        )
    
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {"message": "Registration successful"}, 
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        
        # Check if reset already requested
        cache_key = f'reset_requested_{user.username}'
        if cache.get(cache_key):
            return Response({'message': 'Reset link already sent.'}, status=200)

        # Generate and cache new token
        token = str(uuid.uuid4())
        cache.set(f'password_reset_{token}', user.username, timeout=1800)  # Store token -> username
        cache.set(cache_key, True, timeout=1800)  # Store flag that reset was requested
        host = config('FRONTEND_URL')
        reset_link = f"{host}/reset-password?token={token}"

        # Send email in background
        send_password_reset_email.delay(email, reset_link)

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




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_possible_group_members(request):
    # Exclude current user
    users = User.objects.exclude(id=request.user.id)
    serializer = UserMiniSerializer(users, many=True)
    return Response(serializer.data)



@csrf_exempt
def refresh_token_view(request):
    if request.method != 'POST':
        return JsonResponse(
            {'error': 'Only POST method is allowed'},
            status=405
        )
    
    try:
        # Parse JSON data from request body
        data = json.loads(request.body)
        refresh_token = data.get('refresh')
        
        if not refresh_token:
            return JsonResponse(
                {'error': 'Refresh token is required'},
                status=400
            )
        
        # Validate and refresh token
        refresh = RefreshToken(refresh_token)
        new_access_token = str(refresh.access_token)
        
        # Optional: Rotate refresh token (security best practice)
        new_refresh_token = str(refresh)
        
        return JsonResponse({
            'access': new_access_token,
            'refresh': new_refresh_token  # Include if rotating refresh tokens
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse(
            {'error': 'Invalid JSON data'},
            status=400
        )
    except TokenError:
        return JsonResponse(
            {'error': 'Invalid or expired refresh token'},
            status=401
        )
    except Exception as e:
        return JsonResponse(
            {'error': str(e)},
            status=500
        )