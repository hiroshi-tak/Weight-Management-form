from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from diary.models import Diary

User = get_user_model()


class DiaryModelsTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="test1",
            password="12345678"
        )

    #内容確認
    def test_create_diary(self):
        diary = Diary.objects.create(
            user=self.user,
            weight=65.5,
            record_date="2025-06-10"
        )

        self.assertEqual(diary.weight, 65.5)

    # バリデーション
    def test_weight_min_validator(self):
        diary = Diary(
            user=self.user,
            weight=10,
            record_date="2025-06-11"
        )

        with self.assertRaises(ValidationError):
            diary.full_clean()

    # 重複チェック
    def test_duplicate_record_date(self):
        Diary.objects.create(
            user=self.user,
            weight=65.5,
            record_date="2025-06-12"
        )

        with self.assertRaises(IntegrityError):
            Diary.objects.create(
                user=self.user,
                weight=66.0,
                record_date="2025-06-12"
            )

