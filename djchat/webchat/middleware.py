from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from django.contrib.auth import get_user_model
import jwt


@database_sync_to_async
def get_user(scope):
    token = scope["token"]
    model = get_user_model()

    try:
        if token:
            user_id = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])[
                "user_id"
            ]
            return model.objects.get(id=user_id)
        else:
            return AnonymousUser()
    except (jwt.exceptions.DecodeError, model.DoesNotExist):
        return AnonymousUser()


class JWTAuthMiddleWare:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, recieve, send):
        headers_dict = dict(scope["headers"])
        cookies_str = headers_dict.get(b"cookie", b"").decode()
        cookies = {
            cookie.split("=")[0]: cookie.split("=")[1]
            for cookie in cookies_str.split("; ")
        }
        access_token = cookies.get("access_token")

        scope["token"] = access_token
        scope["user"] = await get_user(scope)

        return await self.app(scope, recieve, send)


# {
#     b"host": b"127.0.0.1:8000",
#     b"connection": b"Upgrade",
#     b"pragma": b"no-cache",
#     b"cache-control": b"no-cache",
#     b"user-agent": b"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
#     b"upgrade": b"websocket",
#     b"origin": b"http://127.0.0.1:5173",
#     b"sec-websocket-version": b"13",
#     b"accept-encoding": b"gzip, deflate, br, zstd",
#     b"accept-language": b"en-US,en;q=0.9",
#     b"cookie": b"colorMode=light; refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTcyMzE0OTEzNiwiaWF0IjoxNzIzMDYyNzM2LCJqdGkiOiJkN2ZkMjVhOTg3MjE0MDQxOTIxYTExMTAwMmI1ODg5ZiIsInVzZXJfaWQiOjEsImV4YW1wbGUiOiJleGFtcGxlIn0.ZYwPgTCnHFA_BoAatnOOnVCIh83t47wdq9tHDDYT-Co; access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzIzMDYzMDM2LCJpYXQiOjE3MjMwNjI3MzYsImp0aSI6IjljMTMwNmU1MDMxMDRiYzhiMDBjMzZhZWNkMTBiMzk5IiwidXNlcl9pZCI6MSwiZXhhbXBsZSI6ImV4YW1wbGUifQ.Erj5KIOeKw_70pZMzLOScO65JxqyXVlTqs__SE4tK_k",
#     b"sec-websocket-key": b"ZyvkLgQLtHPG90y4yfhOsQ==",
#     b"sec-websocket-extensions": b"permessage-deflate; client_max_window_bits",
# }
