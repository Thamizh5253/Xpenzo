from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import pytesseract
from PIL import Image
import logging
import google.generativeai as genai
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from decouple import config




logger = logging.getLogger(__name__)

api_key = config('API_KEY')

# Configure Gemini API
genai.configure(api_key=api_key)

# Initialize the GenerativeModel
model = genai.GenerativeModel('gemini-1.5-pro')



def extract_receipt_data_with_gemini(receipt_text):
    """
    Extracts structured data from receipt text using Gemini AI.
    """
    prompt = f"""
    Extract the following details from the given receipt text:
    - Date of purchase in the format yyyy-MM-dd
    - Category (e.g., food, transport, entertainment, health, shopping, other)
    - amount
    - Payment method (cash/card/other)
    Format the output as JSON in a single line.

    Receipt Text:
    {receipt_text}
    """

    try:
        response = model.generate_content(prompt)
        raw_response = response.text.strip()
        raw_response = raw_response.replace("```", '"').replace("json", "")
        structured_data = json.loads(raw_response)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response: {e}")
        structured_data = {
            "Date": "Unknown",
            "Store": "Unknown",
            "Category": "Other",
            "Amount": "0.00",
            "Payment Mode": "Unknown"
        }
    except Exception as e:
        logger.error(f"Error in Gemini API call: {e}")
        structured_data = {
            "Date": "Unknown",
            "Store": "Unknown",
            "Category": "Other",
            "Amount": "0.00",
            "Payment Mode": "Unknown"
        }

    return structured_data


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@csrf_exempt
def receipt_ocr_api(request):
    print("Received request for receipt OCR API")
    if request.method == 'POST':
        try:
            image_file = request.FILES.get('image')
            if not image_file:
                return JsonResponse({'error': 'No image provided'}, status=400)

            # Perform OCR on the uploaded image
            extracted_text = pytesseract.image_to_string(Image.open(image_file))
            logger.info(f"Extracted Text: {extracted_text}")
            print(f"Extracted Text: {extracted_text}")
            # Process the text with Gemini AI to extract structured data
            receipt_data = extract_receipt_data_with_gemini(extracted_text)
            print(f"Receipt Data: {receipt_data}")

            return JsonResponse({
                'status': 'success',
                'extracted_text': extracted_text,
                'receipt_data': receipt_data
            })
        
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)




