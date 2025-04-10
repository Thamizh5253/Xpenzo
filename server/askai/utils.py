import requests
from django.http import JsonResponse
from collections import namedtuple
from django.db import connection
import google.generativeai as genai

from decouple import config


API_KEY = config('API_KEY')
    # Configure Gemini API
genai.configure(api_key=API_KEY)

    # Initialize the GenerativeModel
model = genai.GenerativeModel('gemini-1.5-flash')


        
import requests
from django.http import JsonResponse

def generate_sql_query_from_ollama(user_id, question):
    try:
        prompt = build_orm_prompt(user_id, question)

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "gemma3:4b",
                # "model": "phi3:mini",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        response.raise_for_status()  # Raises HTTPError if status is 4xx or 5xx
        data = response.json()
        sql_query = data.get("response", "").strip()

        if not sql_query:
            return JsonResponse({"error": "No ORM query generated"}, status=500)

        sql_query = sql_query.replace("```python", "").replace("```", "").replace("```sql", "").strip()
        return sql_query

    except requests.exceptions.Timeout:
        return JsonResponse({"error": "Request to model server timed out"}, status=504)

    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": f"Request failed: {str(e)}"}, status=502)

    except Exception as e:
        return JsonResponse({"error": f"An unexpected error occurred: {str(e)}"}, status=500)

        
  


def generate_sql_query_from_gemini(user_id, question):
    try:
        prompt = build_orm_prompt(user_id, question)
        
        response = model.generate_content(prompt)
        raw_response = response.text.strip()
        
        sql_query = raw_response
        if not sql_query:
            return JsonResponse({"error": "No ORM query generated"}, status=500)
        
        sql_query = sql_query.replace("```python", "").replace("```", "").replace("```sql", "").strip()
        return sql_query

    except AttributeError as e:
        return JsonResponse({"error": f"Attribute error: {str(e)}"}, status=500)

    except Exception as e:
        return JsonResponse({"error": f"An unexpected error occurred: {str(e)}"}, status=500)



def run_custom_join_query(sql_query):
   with connection.cursor() as cursor:
        cursor.execute(sql_query)
        columns = [col[0] for col in cursor.description]
        Result = namedtuple('Result', columns)
        return [Result(*row) for row in cursor.fetchall()]

def generate_human_readable_text(data , question):
    prompt = f"""
You are a smart assistant that turns database data into simple, friendly summaries for clients who are not technical.
- If there is no data then politely inform the user that no data was found.

- If the data contains a list of items, summarize the key details clearly, using bullet points or short sentences.
- If the data is related to expenses, describe what was spent, on what, when, and how. Then offer 1-2 friendly budgeting tips.
- Align your response with the user's question.
- Avoid any introductions or technical explanations — just give the summary or answer.
- Use natural language that feels helpful and easy to understand.
- Payments are in Rupees
Here is the data:
{data}

User’s question:
{question}

Only return a clear, friendly summary or answer — nothing else.
"""

    try:
        response = model.generate_content(prompt)
        # data = response.json()
        user_response = response.text.strip()
        if not user_response:
            return JsonResponse({"error": "error while generating user response "}, status=500)
        # sql_query = sql_query.replace("```python", "").replace("```", "").strip()

        print("Generated user data:",  user_response)
        return user_response
    except Exception as e:
        return JsonResponse({"error": "Failed to generate User response", "details": str(e)}, status=500)

# You can keep this below your view
def build_orm_prompt(user_id, question):
    return  f"""
You are a SQL expert. Based on the following Django models, generate a **single-line SQL SELECT query** only for data retrieval.
Make the query as simple and optimized as possible, and ensure it is valid SQL syntax.
⚠️ VERY IMPORTANT RULES to follow:
0.(Most important Guard Promt) 
You are an assistant helping users query their income and expenses from a database.
You can only answer questions related to finance, expenses, income, or business analytics.
If the user's question is not related to SQL or business-related queries, politely respond:
---
"I’m here to help with your income, expenses, and related data. Could you please ask a relevant question?"
---
1. Use actual table and column names — **not Django/ORM-style notation**.
   ❌ Do NOT use `user.id`, `user.username`, or `userprofile.user`  
   ✅ Use `expense_expense.user_id`, `auth_user.username`, `users_userprofile.user_id`

2. only if need then go with joins. JOINs must be made with the correct tables:
   - For user info, join `expense_expense.user_id = auth_user.id`
   - For profile info, join `expense_expense.user_id = users_userprofile.user_id`
   - NEVER JOIN directly with `user` or use `user.id` in SQL

3. Every SELECT query must include the primary key of the base table (e.g., `expense_expense.id`).

4. Only SELECT queries are allowed.
   ❌ INSERT, UPDATE, DELETE — respond with: "You do not have permission to perform this action."

5. Use `user_id={user_id}` to filter results for all user don`t give others data strictly warned.

6. Output should be:
   - One line only
   - Without backticks (```)
   - Without the word "SQL"
   - In valid raw SQL syntax directly usable with Django's cursor

7. Use aliases for any calculated fields
8. SQL is date related then use respective date format clearly current year is 2025
---

Models:
Table: expense_expense  
class Expense(models.Model):
    id = models.AutoField(primary_key=True)  
    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    amount = models.DecimalField()  
    category = models.CharField( choices=CATEGORIES, default='other')  
    date = models.DateField()  
    description = models.TextField(blank=True)  
    payment_method = models.CharField( choices=PAYMENT_METHODS)  

Table: users_userprofile  
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  
    monthly_budget = models.DecimalField( default=0.00)  
    savings_goal = models.DecimalField( default=0.00)  
    income = models.DecimalField( default=0.00)  
    

Table: auth_user  
(Django’s default user table — includes fields like id, username, email, etc.)


    PAYMENT_METHODS = ['cash', 'card', 'upi','other']

    CATEGORIES = ['food', 'transport', 'entertainment', 'health', 'shopping', 'other']
    
---

Question: {question}
"""