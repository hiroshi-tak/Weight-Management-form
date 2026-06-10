from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        User.objects.create_user(
            username="test1",
            password="12345678"
        )
        self.stdout.write(self.style.SUCCESS("User created"))