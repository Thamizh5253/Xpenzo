# Generated by Django 5.1.7 on 2025-04-29 09:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='upi_id',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
