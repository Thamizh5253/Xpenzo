from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ExpenseSchedule
from .serializers import ExpenseScheduleSerializer


@api_view(["POST", "PUT"])
@permission_classes([IsAuthenticated])
def create_or_update_schedule(request, schedule_id=None):
    try:
        if schedule_id:
            try:
                schedule = ExpenseSchedule.objects.get(id=schedule_id, user=request.user)
            except ExpenseSchedule.DoesNotExist:
                return Response({"error": "Schedule not found."}, status=status.HTTP_404_NOT_FOUND)
            created = False
        else:
            schedule = ExpenseSchedule(user=request.user)
            created = True
        print(request.data)
        serializer = ExpenseScheduleSerializer(schedule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print(request.data)

            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_schedules(request, schedule_id=None):
    try:
        if schedule_id:
            try:
                schedule = ExpenseSchedule.objects.get(id=schedule_id, user=request.user)
            except ExpenseSchedule.DoesNotExist:
                return Response({"error": "Schedule not found."}, status=status.HTTP_404_NOT_FOUND)
            serializer = ExpenseScheduleSerializer(schedule)
            return Response(serializer.data)
        else:
            schedules = ExpenseSchedule.objects.filter(user=request.user)
            serializer = ExpenseScheduleSerializer(schedules, many=True)
            return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_schedule(request, schedule_id):
    try:
        try:
            schedule = ExpenseSchedule.objects.get(id=schedule_id, user=request.user)
        except ExpenseSchedule.DoesNotExist:
            return Response({"error": "Schedule not found."}, status=status.HTTP_404_NOT_FOUND)
        
        schedule.delete()
        return Response({"message": "Schedule deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
