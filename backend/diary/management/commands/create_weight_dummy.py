from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from diary.models import Diary
from datetime import date, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = "体重ダミーデータ作成"

    def handle(self, *args, **kwargs):

        user = User.objects.first()

        if not user:
            self.stdout.write(
                self.style.ERROR("ユーザーが存在しません")
            )
            return

        start_date = date(2026, 4, 1)

        for i in range(90):
            Diary.objects.create(
                user=user,
                weight=round(random.uniform(63.0, 66.0), 1),
                body_fat=round(random.uniform(14.0, 20.0), 1),
                memo=f"ダミーデータ{i+1}",
                record_date=start_date + timedelta(days=i)
            )

        self.stdout.write(
            self.style.SUCCESS(
                "ダミーデータ作成完了"
            )
        )