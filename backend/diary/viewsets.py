from datetime import date
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Diary, HeightMonthly
from .serializers import (
    DiarySerializer,
    HeightMonthlySerializer,
)

class DiaryViewSet(viewsets.ModelViewSet):
    serializer_class = DiarySerializer
    permission_classes = [IsAuthenticated]

    queryset = Diary.objects.all()
    serializer_class = DiarySerializer

    filter_backends = (filters.SearchFilter,)
    search_fields = ("memo",)

    def get_queryset(self):
        queryset = Diary.objects.filter(
            user=self.request.user
        )

        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")

        if year and month:
            year = int(year)
            month = int(month)

            start_date = date(year, month, 1)

            if month == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month + 1, 1)

            queryset = queryset.filter(
                record_date__gte=start_date,
                record_date__lt=end_date,
            )

        return queryset.order_by("record_date")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )


class HeightMonthlyViewSet(viewsets.ModelViewSet):
    serializer_class = HeightMonthlySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = HeightMonthly.objects.filter(user=self.request.user)

        year = self.request.query_params.get("year")

        if year:
            queryset = queryset.filter(year=year)

        return queryset.order_by("-year", "-month")

    @action(detail=False, methods=["get"])
    def latest(self, request):
        latest_height = (
            HeightMonthly.objects
            .filter(user=request.user)
            .order_by("-year", "-month")
            .first()
        )

        if not latest_height:
            return Response(
                {"detail": "身長データがありません"},
                status=404
            )

        serializer = self.get_serializer(latest_height)
        return Response(serializer.data)