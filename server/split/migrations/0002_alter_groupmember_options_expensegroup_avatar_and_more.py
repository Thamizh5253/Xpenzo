# Generated by Django 5.1.7 on 2025-04-23 05:38

import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expense', '0005_remove_expense_receipt_image'),
        ('split', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='groupmember',
            options={'ordering': ['joined_at']},
        ),
        migrations.AddField(
            model_name='expensegroup',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='group_avatars/'),
        ),
        migrations.AddField(
            model_name='expensegroup',
            name='currency',
            field=models.CharField(default='INR', max_length=3),
        ),
        migrations.AddField(
            model_name='expensegroup',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='expensegroup',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='expensesplit',
            name='is_settled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='expensesplit',
            name='percentage',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
        migrations.AddField(
            model_name='expensesplit',
            name='settled_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='expensesplit',
            name='shares',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='groupexpense',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='groupexpense',
            name='personal_expense',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='expense.expense'),
        ),
        migrations.AddField(
            model_name='groupexpense',
            name='receipt',
            field=models.ImageField(blank=True, null=True, upload_to='expense_receipts/'),
        ),
        migrations.AddField(
            model_name='groupexpense',
            name='split_type',
            field=models.CharField(choices=[('EQUAL', 'Equal'), ('EXACT', 'Exact amounts'), ('PERCENT', 'Percentage'), ('SHARES', 'Shares')], default='EQUAL', max_length=10),
        ),
        migrations.AddField(
            model_name='groupexpense',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='groupmember',
            name='is_admin',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='groupmember',
            name='nickname',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='settlement',
            name='completed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='settlement',
            name='notes',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='settlement',
            name='payment_method',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='settlement',
            name='transaction_reference',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='settlement',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('settled', 'Settled'), ('cancelled', 'Cancelled')], default='pending', max_length=20),
        ),
        migrations.AlterUniqueTogether(
            name='expensesplit',
            unique_together={('expense', 'user')},
        ),
        migrations.CreateModel(
            name='GroupInvitation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('token', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('expired', 'Expired')], default='pending', max_length=10)),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='split.expensegroup')),
                ('invited_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
