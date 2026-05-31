from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Entry
from .serializers import EntrySerializer
from accounts.serializers import UserSerializer

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        entries = Entry.objects.filter(user=request.user).prefetch_related('tags')
        return Response({
            'success': True,
            'entries': EntrySerializer(entries, many=True).data,
            'user_info': UserSerializer(request.user).data,
        })

class EntryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EntrySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['data', 'title', 'tags__name']

    def get_queryset(self):
        qs = Entry.objects.filter(user=self.request.user).prefetch_related('tags')
        date = self.request.query_params.get('date')
        if date:
            qs = qs.filter(date_time__date=date)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EntrySerializer

    def get_queryset(self):
        return Entry.objects.filter(user=self.request.user).prefetch_related('tags')
