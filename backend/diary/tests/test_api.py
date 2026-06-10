from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch
from django.utils import timezone
from diary.models import Diary, HeightMonthly

User = get_user_model()

class DiaryAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="test1",
            password="12345678"
        )

        self.client.force_authenticate(
            user=self.user
        )

    # 一覧取得
    def test_list_weights(self):
        self.client.post("/api/diary/", {
            "weight": 65.5,
            "record_date": "2025-06-01"
        })

        response = self.client.get("/api/diary/")
        self.assertEqual(response.status_code, 200)

    # 単体取得
    def test_retrieve_weight(self):
        res = self.client.post("/api/diary/", {
            "weight": 65.5,
            "record_date": "2025-06-02"
        })

        self.assertEqual(res.status_code, 201)
        
        pk = res.data["id"]

        response = self.client.get(f"/api/diary/{pk}/")
        self.assertEqual(response.status_code, 200)

    # バリデーション異常
    def test_invalid_weight(self):
        response = self.client.post("/api/diary/", {
            "weight": -10,
            "record_date": "2025-06-03"
        })

        self.assertEqual(response.status_code, 400)

    # record_dataなし
    def test_missing_field(self):
        response = self.client.post("/api/diary/", {
            "weight": 65.5
        })

        self.assertEqual(response.status_code, 400)

    # 重複制御
    def test_duplicate_date(self):
        self.client.post("/api/diary/", {
            "weight": 65.5,
            "record_date": "2025-06-04"
        })

        response = self.client.post("/api/diary/", {
            "weight": 66.0,
            "record_date": "2025-06-04"
        })

        self.assertEqual(response.status_code, 400)

    # update
    def test_update_weight(self):
        res = self.client.post("/api/diary/", {
            "weight": 65.5,
            "record_date": "2025-06-05"
        })

        pk = res.data["id"]

        response = self.client.patch(
            f"/api/diary/{pk}/",
            {"weight": 64.0},
            format="json"
        )

        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/diary/{pk}/")
        self.assertEqual(
            float(response.data["weight"]),
            64.0
        )

    # DELETE
    def test_delete_weight(self):
        res = self.client.post("/api/diary/", {
            "weight": 65.5,
            "record_date": "2025-06-06"
        })

        pk = res.data["id"]

        response = self.client.delete(f"/api/diary/{pk}/")
        self.assertEqual(response.status_code, 204)

        response = self.client.get(f"/api/diary/{pk}/")
        self.assertEqual(response.status_code, 404)

    # MonthlyAveragesView
    def test_monthly_average_without_year(self):

        response = self.client.get(
            "/api/diary/monthly-averages/"
        )

        self.assertEqual(
            response.status_code,
            400
        )

    # year指定
    def test_monthly_average(self):

        self.client.post(
            "/api/diary/",
            {
                "weight": 60,
                "record_date": "2025-06-01"
            }
        )

        self.client.post(
            "/api/diary/",
            {
                "weight": 62,
                "record_date": "2025-06-02"
            }
        )

        response = self.client.get(
            "/api/diary/monthly-averages/?year=2025"
        )

        self.assertEqual(
            response.status_code,
            200
        )

        self.assertEqual(
            float(response.data[5]["avg"]),
            61.0
        )

    # MeView
    def test_me_view(self):

        response = self.client.get(
            "/api/me/"
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.data["username"],
            "test1"
        )

    # AIAnalysisView
    def test_ai_analysis_no_data(self):

        response = self.client.get(
            "/api/ai-analysis/"
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.data["analysis"],
            "データがありません"
        )

    # Gemini呼び出し成功
    @patch("diary.views.genai.GenerativeModel")
    def test_ai_analysis_success(
        self,
        mock_model
    ):

        mock_response = type(
            "MockResponse",
            (),
            {"text": "体重は減少傾向です"}
        )

        mock_model.return_value.generate_content.return_value = (
            mock_response
        )

        Diary.objects.create(
            user=self.user,
            weight=65,
            record_date=timezone.now().date()
        )

        response = self.client.get(
            "/api/ai-analysis/"
        )

        self.assertEqual(
            response.status_code,
            200
        )

        self.assertIn(
            "減少",
            response.data["analysis"]
        )

    # Geminiエラー
    @patch("diary.views.genai.GenerativeModel")
    def test_ai_analysis_error(
        self,
        mock_model
    ):

        mock_model.side_effect = Exception(
            "API Error"
        )

        Diary.objects.create(
            user=self.user,
            weight=65,
            record_date=timezone.now().date()
        )

        response = self.client.get(
            "/api/ai-analysis/"
        )

        self.assertEqual(
            response.status_code,
            500
        )