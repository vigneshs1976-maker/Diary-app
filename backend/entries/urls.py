from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('entries/', views.EntryListCreateView.as_view(), name='entry-list-create'),
    path('entries/<int:pk>/', views.EntryDetailView.as_view(), name='entry-detail'),
]
