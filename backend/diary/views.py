import logging
import google.generativeai as genai

from datetime import timedelta
from django.utils import timezone

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Diary, HeightMonthly
from django.conf import settings

from django.db.models import Avg

genai.configure(api_key=settings.GEMINI_API_KEY)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
        })

class AIAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        today = timezone.now().date()
        start_date = today - timedelta(days=30)

        diaries = Diary.objects.filter(
            user=request.user,
            record_date__gte=start_date
        ).order_by("record_date")

        if not diaries.exists():
            return Response({"analysis": "データがありません"})

        latest_height = HeightMonthly.objects.filter(
            user=request.user
        ).order_by("-year", "-month").first()

        weights = [float(d.weight) for d in diaries]

        first_weight = weights[0]
        last_weight = weights[-1]

        avg_weight = sum(weights) / len(weights)
        diff = last_weight - first_weight

        height_cm = float(latest_height.height_cm) if latest_height else None

        bmi = None
        if height_cm:
            bmi = round(last_weight / ((height_cm / 100) ** 2), 1)

        prompt = f"""
あなたは医療ではなくフィットネス補助AIです。

以下の数値データを正確に分析してください。

【データ】
平均体重: {avg_weight:.1f}kg
体重変化: {diff:+.1f}kg
最新体重: {last_weight:.1f}kg
身長: {height_cm if height_cm else "不明"}
BMI: {bmi if bmi else "不明"}

【必ず含める内容】
1. 体重トレンド（減少・増加・横ばいのどれか1つ）
2. 変化の理由の推測（短く）
3. BMIの評価（ある場合のみ）
4. 1つだけ具体的な改善アドバイス

【制約】
- 日本語
- 60文字程度
- 箇条書き禁止
- 数値を必ず使用
"""

        try:
            model = genai.GenerativeModel("models/gemini-2.5-flash")

            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.5,
                    "max_output_tokens": 1200,
                }
            )

            analysis_text = getattr(response, "text", None)

            if not analysis_text:
                analysis_text = "AIからの応答が取得できませんでした。"

            return Response({  
                "analysis": analysis_text
            })

        except Exception as e:
            logging.exception("Gemini API error")
            return Response({
                "analysis": "AI分析に失敗しました"
            }, status=500)


class MonthlyAveragesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        year = request.query_params.get("year")

        if not year:
            return Response(
                {"detail": "yearが必要です"},
                status=400
            )

        year = int(year)

        qs = Diary.objects.filter(
            user=request.user,
            record_date__year=year
        )

        result = []

        for month in range(1, 13):
            avg = qs.filter(
                record_date__month=month
            ).aggregate(avg_weight=Avg("weight"))["avg_weight"]

            result.append({
                "month": month,
                "avg": float(avg) if avg else 0
            })

        return Response(result)