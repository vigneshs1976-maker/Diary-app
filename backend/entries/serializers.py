from rest_framework import serializers
from .models import Entry, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class EntrySerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True, required=False, default=[]
    )

    class Meta:
        model = Entry
        fields = ['id', 'title', 'data', 'color', 'date_time', 'tags', 'tag_names', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        entry = Entry.objects.create(**validated_data)
        for name in tag_names:
            if name.strip():
                Tag.objects.create(entry=entry, name=name.strip())
        return entry

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if tag_names is not None:
            instance.tags.all().delete()
            for name in tag_names:
                if name.strip():
                    Tag.objects.create(entry=instance, name=name.strip())
        return instance
