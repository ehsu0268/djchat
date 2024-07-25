from rest_framework import viewsets
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.response import Response
from django.db.models import Count
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .models import Category, Server
from .schema import server_list_docs
from .serializer import CategorySerializer, ServerSerializer


class CategoryListViewSet(viewsets.ViewSet):
    queryset = Category.objects.all()

    @extend_schema(responses=CategorySerializer)
    def list(self, request):
        serializer = CategorySerializer(self.queryset, many=True)
        return Response(serializer.data)


class ServerListViewSet(viewsets.ViewSet):

    queryset = Server.objects.all()
    # permission_classes = [IsAuthenticated]

    @server_list_docs
    def list(self, request):
        """
        Retrieves a list of servers based on query parameters and returns a serialized response.

        Args:
            request (Request): The request object containing query parameters.

        Raises:
            AuthenticationFailed: If 'by_user' or 'by_serverid' parameters are used
                                   and the user is not authenticated.

            ValidationError: If there's an issue with the 'by_serverid' parameter,
                             such as an invalid ID or the server does not exist.

        Returns:
            Response: A Response object containing serialized server data.

        Query Parameters:
            - category (str, optional): Filters servers by category name.
            - qty (int, optional): Limits the number of servers returned.
            - by_user (bool, optional): If 'true', filters servers by the current user.
            - by_serverid (int, optional): Filters servers by the specified server ID.
            - with_num_members (bool, optional): If 'true', includes the count of members
                                                 in each server's representation.

        Notes:
            This method modifies the 'queryset' attribute of the instance based on the
            provided query parameters before serializing and returning the data.
        """
        category = request.query_params.get("category")
        qty = request.query_params.get("qty")
        by_user = request.query_params.get("by_user") == "true"
        by_serverid = request.query_params.get("by_serverid")
        with_num_members = request.query_params.get("with_num_members") == "true"

        # if by_user or by_serverid and not request.user.is_authenticated:
        #     raise AuthenticationFailed()

        if category:
            self.queryset = self.queryset.filter(category__name=category)

        if by_user:
            if by_user and request.user.is_authenticated:
                user_id = request.user.id
                self.queryset = self.queryset.filter(member=user_id)
            else:
                AuthenticationFailed()

        if with_num_members:
            self.queryset = self.queryset.annotate(num_members=Count("member"))

        if qty:
            self.queryset = self.queryset[: int(qty)]

        if by_serverid:
            # if not request.user.is_authenticated:
            #     raise AuthenticationFailed()

            try:
                self.queryset = self.queryset.filter(id=by_serverid)
                if not self.queryset.exists():
                    raise ValidationError(
                        detail=f"Server with id {by_serverid} not found"
                    )
            except ValueError:
                raise ValidationError(detail="Server value error")

        serializer = ServerSerializer(
            self.queryset, many=True, context={"num_members": with_num_members}
        )
        return Response(serializer.data)
