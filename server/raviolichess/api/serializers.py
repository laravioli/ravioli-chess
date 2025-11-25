from rest_framework import serializers


class DetailResponseSerializer(serializers.Serializer):
    detail = serializers.CharField(read_only=True, required=False)


class EmptyRequestSerializer(serializers.Serializer):
    pass
