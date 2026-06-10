from rest_framework import serializers
from .models import Diary, HeightMonthly


class DiarySerializer(serializers.ModelSerializer):

    class Meta:
        model = Diary
        fields = [
            "id",
            "weight",
            "body_fat",
            "memo",
            "record_date",
        ]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

    def validate_record_date(self, value):
        qs = Diary.objects.filter(
            user=self.context["request"].user,
            record_date=value
        )

        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                "この日の体重は既に登録されています"
            )

        return value

    def validate_weight(self, value):
        if value < 20 or value > 300:
            raise serializers.ValidationError(
                "体重の値が不正です"
            )

        return value

    def validate_body_fat(self, value):
        if value is None:
            return value

        if value < 0 or value > 60:
            raise serializers.ValidationError(
                "体脂肪率の値が不正です（0〜60%）"
            )

        return value


class HeightMonthlySerializer(serializers.ModelSerializer):

    class Meta:
        model = HeightMonthly
        fields = [
            "id",
            "year",
            "month",
            "height_cm",
            "target_weight",
        ]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

    def validate_height_cm(self, value):
        if value < 50 or value > 300:
            raise serializers.ValidationError(
                "身長の値が不正です"
            )

        return value

    def validate_target_weight(self, value):
        if value < 20 or value > 300:
            raise serializers.ValidationError(
                "目標体重の値が不正です"
            )

        return value

    def validate(self, attrs):
        year = attrs.get(
            "year",
            self.instance.year if self.instance else None
        )

        month = attrs.get(
            "month",
            self.instance.month if self.instance else None
        )

        qs = HeightMonthly.objects.filter(
            user=self.context["request"].user,
            year=year,
            month=month,
        )

        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                "この年月の身長は既に登録されています"
            )

        return attrs