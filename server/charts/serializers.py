from rest_framework import serializers


# Serializers
class SummarySerializer(serializers.Serializer):
    total_spent = serializers.FloatField()
    monthly_trend = serializers.DictField(child=serializers.FloatField())
    daily_trend = serializers.DictField(child=serializers.FloatField())

class CategoryWiseSerializer(serializers.Serializer):
    category_spending = serializers.DictField(child=serializers.FloatField())