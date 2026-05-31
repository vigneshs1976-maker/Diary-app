from django.db import models
from django.conf import settings

COLOR_CHOICES = [
    (1, 'Cream'), (2, 'Mint'), (3, 'Lavender'), (4, 'Light Green'),
    (5, 'Pink'), (6, 'Sky Blue'), (7, 'Yellow'), (8, 'Teal'), (9, 'Light Blue'),
]

class Entry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='entries')
    title = models.CharField(max_length=200, blank=True, default='')
    data = models.TextField()
    color = models.IntegerField(choices=COLOR_CHOICES, default=1)
    date_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_time']

    def __str__(self):
        return f"{self.user.username} - {self.date_time.date()}"

class Tag(models.Model):
    entry = models.ForeignKey(Entry, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name
