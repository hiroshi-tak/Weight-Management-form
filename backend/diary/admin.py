from django.contrib import admin
from .models import Diary

@admin.register(Diary)
class DiaryAdmin(admin.ModelAdmin):
    list_display = (
        "weight",
        "record_date",
        "created_at",
        "updated_at",
    )