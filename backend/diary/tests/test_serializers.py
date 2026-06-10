from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory

from diary.models import Diary, HeightMonthly
from diary.serializers import (
    DiarySerializer,
    HeightMonthlySerializer
)

User = get_user_model()

class DiarySerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="test1",
            password="12345678"
        )

        self.factory = APIRequestFactory()

        self.request = self.factory.post("/")
        self.request.user = self.user

    def test_invalid_weight(self):

        serializer = DiarySerializer(
            data={
                "weight": 10,
                "record_date": "2025-07-01"
            },
            context={"request": self.request}
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("weight", serializer.errors)

    def test_invalid_body_fat(self):

        serializer = DiarySerializer(
            data={
                "weight": 65,
                "body_fat": 80,
                "record_date": "2025-07-02"
            },
            context={"request": self.request}
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("body_fat", serializer.errors)

    def test_duplicate_record_date(self):

        Diary.objects.create(
            user=self.user,
            weight=65,
            record_date="2025-07-03"
        )

        serializer = DiarySerializer(
            data={
                "weight": 66,
                "record_date": "2025-07-03"
            },
            context={"request": self.request}
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn(
            "record_date",
            serializer.errors
        )

    def test_invalid_height(self):

        serializer = HeightMonthlySerializer(
            data={
                "year": 2025,
                "month": 6,
                "height_cm": 400,
                "target_weight": 65
            },
            context={"request": self.request}
        )

        self.assertFalse(serializer.is_valid())

    def test_invalid_target_weight(self):

        serializer = HeightMonthlySerializer(
            data={
                "year": 2025,
                "month": 7,
                "height_cm": 170,
                "target_weight": 10
            },
            context={"request": self.request}
        )

        self.assertFalse(serializer.is_valid())

    def test_duplicate_year_month(self):

        HeightMonthly.objects.create(
            user=self.user,
            year=2025,
            month=6,
            height_cm=170,
            target_weight=65
        )

        serializer = HeightMonthlySerializer(
            data={
                "year": 2025,
                "month": 6,
                "height_cm": 171,
                "target_weight": 64
            },
            context={"request": self.request}
        )

        self.assertFalse(serializer.is_valid())