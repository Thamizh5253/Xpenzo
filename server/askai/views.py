import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.models import User
import logging
import sqlparse
from  .models import ChatHistory
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ChatHistorySerializer
from .utils import generate_sql_query_from_gemini  , generate_sql_query_from_ollama , run_custom_join_query ,generate_human_readable_text

logger = logging.getLogger(__name__)



@api_view([ "POST"])
@permission_classes([IsAuthenticated])
def ask_orm_query_view(request):
    
    
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method allowed"}, status=405)
    try:
        body = json.loads(request.body.decode("utf-8"))
        question = body.get("question")
    except Exception as e:
        return JsonResponse({"error": "Invalid JSON body", "details": str(e)}, status=400)
    
    try:
        
        sql_query = generate_sql_query_from_gemini(request.user.id, question)+';'
        # sql_query = generate_sql_query_from_ollama(request.user.id, question)

        print("Generated ORM Query:", sql_query)

        if not looks_like_sql(sql_query):
            return JsonResponse({
                "error": "This doesn't look like a SQL query",
                "llm_response": sql_query
            }, status=400)

        if not is_safe_sql(sql_query):
            return JsonResponse({
                "error": "Unsafe SQL query detected",
                "llm_response": "There might be a problem. Try again"
            }, status=400)

        if not is_valid_sql(sql_query):
            return JsonResponse({
                "error": "Malformed SQL query",
                "llm_response": "There might be a problem. Try again"

            }, status=400)

        
        data = run_custom_join_query(sql_query)

        clean_data = []
        for item in data:
            item_dict = item._asdict()  # Already a dict, no need for vars()
            item_dict.pop('_state', None)  # Optional: only needed if _state exists
            clean_data.append(item_dict)
        

        print(clean_data)
        # user_response = "done: "
        user_response = generate_human_readable_text(clean_data , question)

        ChatHistory.objects.create(
    user=request.user,
    question=question,
    generated_orm_query=sql_query,
    user_response=user_response
)

    except Exception as e:
        print(e)
        return JsonResponse({"error": "Failed to generate ORM query or retrieve data", "details": str(e)}, status=500)
    
    
    return JsonResponse({
        
        "question": question,
        "generated_orm_query": sql_query,
        "user_response": user_response,
    })


# List of potentially dangerous SQL keywords
DISALLOWED_KEYWORDS = [
    "drop", "delete", "truncate", "alter", "insert", "update", "create", "--", "/*", "*/"
]

def looks_like_sql(query: str) -> bool:
    """
    Basic check to see if a string looks like a valid SQL SELECT statement.
    """
    query = query.strip().lower()
    return query.startswith(("select", "with")) and ";" in query


def is_safe_sql(query: str) -> bool:
    """
    Check if a SQL query avoids destructive commands (basic safety guard).
    """
    query = query.lower()
    parsed = sqlparse.parse(query)

    for stmt in parsed:
        tokens = [str(token).strip().lower() for token in stmt.tokens if not token.is_whitespace]
        for keyword in DISALLOWED_KEYWORDS:
            if any(keyword in token for token in tokens):
                return False
    return True


def is_valid_sql(query: str) -> bool:
    """
    Check if the SQL can be parsed (structurally valid).
    """
    try:
        return bool(sqlparse.parse(query))
    except:
        return False






class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get the latest 50 messages for the user, ordered by most recent
            chat_history = ChatHistory.objects.filter(
                user=request.user
            ).order_by('created_at')[:50]
            
            serializer = ChatHistorySerializer(chat_history, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )