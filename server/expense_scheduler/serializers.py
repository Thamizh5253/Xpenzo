from rest_framework import serializers
from .models import ExpenseSchedule

class ExpenseScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseSchedule
        fields = [
            "id",
            "user",
            "name",
            "amount",
            "frequency",
            "interval",
            "start_date",
            "end_date",
            "next_occurrence",
            "last_processed",
            "category",
            "payment_method",
            "description",
            "is_active",  # ✅ Replace 'status' with this

            "created_at",
            "updated_at"
        ]
        read_only_fields = ["user", "next_occurrence", "last_processed", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
