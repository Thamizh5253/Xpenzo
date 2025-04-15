# from django.apps import AppConfig


# class ExpenseSchedulerConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'expense_scheduler'



from django.apps import AppConfig
from django.db.models.signals import post_migrate
import json


class ExpenseSchedulerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'expense_scheduler'

    def ready(self):
        # Connect the post_migrate signal to setup periodic tasks
        post_migrate.connect(self.setup_periodic_tasks, sender=self)

    def setup_periodic_tasks(self, sender, **kwargs):

        from django_celery_beat.models import PeriodicTask, IntervalSchedule
        
        # Create the interval schedule (e.g., daily)
        schedule, created = IntervalSchedule.objects.get_or_create(
            every=1,
            period=IntervalSchedule.DAYS,
        )

        # Create a PeriodicTask that triggers the task daily
        PeriodicTask.objects.get_or_create(
            interval=schedule,
            name='Process Expense Schedules Daily',
            task='expense_scheduler.tasks.process_expense_schedules',  # Your Celery task
            defaults={'kwargs': json.dumps({})}
        )
