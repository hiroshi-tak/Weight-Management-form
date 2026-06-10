import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User

class Diary(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="ID"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    weight = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        validators=[
            MinValueValidator(20),
            MaxValueValidator(300)
        ],
        verbose_name="体重(kg)"
    )

    body_fat = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(60)
        ],
        verbose_name="体脂肪率(%)"
    )

    memo = models.TextField(
        max_length=2000,
        blank=True,
        verbose_name="メモ"
    )

    record_date = models.DateField(
        verbose_name="記録日"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "record_date"],
                name="unique_user_record_date"
            )
        ]

    def __str__(self):
        return f"{self.record_date} {self.weight}kg"


class HeightMonthly(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    year = models.IntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(2100)]
    )

    month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)]
    )

    height_cm = models.DecimalField(
        max_digits=5,
        decimal_places=1
    )

    target_weight = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        validators=[
            MinValueValidator(20),
            MaxValueValidator(300)
        ],
        verbose_name="目標体重(kg)"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "year", "month"],
                name="unique_year_month_height"
            )
        ]

    def __str__(self):
        return f"{self.year}-{self.month:02d} {self.height_cm}cm"