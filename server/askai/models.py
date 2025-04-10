from django.db import models
from django.contrib.auth.models import User

class ChatHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_history')
    question = models.TextField()
    generated_orm_query = models.TextField(blank=True, null=True)
    user_response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat by {self.user.username} on {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
