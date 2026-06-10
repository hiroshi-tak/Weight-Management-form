from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from diary.models import HeightMonthly
from decimal import Decimal

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        user = User.objects.first()

        if not user:
            self.stdout.write(
                self.style.ERROR("ユーザーが存在しません")
            )
            return

        data = [
            (2026, 1, 170.0, 65.0),
            (2026, 2, 170.0, 64.5),
            (2026, 3, 170.0, 64.0),
            (2026, 4, 170.0, 63.5),
            (2026, 5, 170.0, 63.0),
        ]

        for year, month, height, target in data:
            obj, created = HeightMonthly.objects.get_or_create(
                user=user,
                year=year,
                month=month,
                defaults={
                    "height_cm": Decimal(str(height)),
                    "target_weight": Decimal(str(target)),
                }
            )

            if created:
                self.stdout.write(f"created: {year}-{month}")
            else:
                self.stdout.write(f"exists: {year}-{month}")

        self.stdout.write(self.style.SUCCESS("done"))