from rest_framework import routers
from diary.viewsets import (
    DiaryViewSet,
    HeightMonthlyViewSet,
)

router = routers.DefaultRouter()
router.register(
    "diary",
    DiaryViewSet,
    basename="diary"
)

router.register(
    "height-monthly",
    HeightMonthlyViewSet,
    basename="height-monthly"
)

