from rest_framework import pagination
from rest_framework.response import Response


class CustomPagination(pagination.PageNumberPagination):
    def get_paginated_response(self, data):
        p = self.page.paginator
        headers = {
            'pages': p.num_pages,
            'records': p.count,
            'page_no': self.page.number,
            'per_page': p.per_page,
            'Access-Control-Expose-Headers': 'pages, records'
        }
        return Response(data, headers=headers)
