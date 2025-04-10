# from rest_framework import serializers
# from .models import OCRImage

# class OCRImageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = OCRImage
#         fields = ('id', 'image', 'uploaded_at')


from rest_framework import serializers

class ReceiptDataSerializer(serializers.Serializer):
    status = serializers.CharField(default="success")
    extracted_text = serializers.CharField()
    receipt_data = serializers.DictField()
