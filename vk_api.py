import requests
import time

from datetime import datetime, timedelta


API_VERSION = "5.199"


class VKClient:

    def __init__(self, token: str):
        self.token = token

    # ==================================================
    # BASE REQUEST
    # ==================================================

    def call(self, method: str, **params):

        params["access_token"] = self.token
        params["v"] = API_VERSION

        r = requests.get(
            f"https://api.vk.com/method/{method}",
            params=params,
            timeout=60
        ).json()

        if "error" in r:
            raise Exception(r["error"]["error_msg"])

        return r["response"]

    # ==================================================
    # TOKEN CHECK
    # ==================================================

    def validate(self):

        try:
            self.call("users.get")
            return True

        except Exception:
            return False

    # ==================================================
    # RESOLVE SCREEN NAME
    # ==================================================

    def resolve(self, target: str):

        target = target.strip()
        target = target.replace("https://vk.com/", "")
        target = target.strip("/")

        resolved = self.call(
            "utils.resolveScreenName",
            screen_name=target
        )

        obj_type = resolved["type"]
        object_id = resolved["object_id"]

        # -----------------------------
        # GROUP
        # -----------------------------

        if obj_type == "group":

            response = self.call(
                "groups.getById",
                group_id=object_id
            )

            print("GROUP RESPONSE:", response)

            if isinstance(response, list):

                group = response[0]

            elif isinstance(response, dict):

                if "groups" in response:
                    group = response["groups"][0]
                else:
                    group = response

            else:

                raise Exception(
                    f"Неожиданный ответ VK: {response}"
                )

            return {
                "owner_id": -object_id,
                "screen_name": group.get("screen_name", target),
                "display_name": group.get("name", target),
                "type": "group"
            }

    # ==================================================
    # POSTS
    # ==================================================

    def get_posts(
        self,
        owner_id: int,
        limit: int = 0,
        year_only: bool = False
    ):

        posts = []

        offset = 0
        batch_size = 100

        cutoff = datetime.now() - timedelta(days=365)

        while True:

            response = self.call(
                "wall.get",
                owner_id=owner_id,
                count=batch_size,
                offset=offset
            )

            items = response["items"]

            if not items:
                break

            for p in items:

                dt = datetime.fromtimestamp(p["date"])

                if year_only and dt < cutoff:
                    return posts

                posts.append({
                    "id": p["id"],
                    "owner_id": owner_id,
                    "date": dt.isoformat(),

                    "text": p.get("text", ""),

                    "likes": p.get(
                        "likes",
                        {}
                    ).get("count", 0),

                    "reposts": p.get(
                        "reposts",
                        {}
                    ).get("count", 0),

                    "comments": p.get(
                        "comments",
                        {}
                    ).get("count", 0),

                    "url": (
                        f"https://vk.com/"
                        f"wall{owner_id}_{p['id']}"
                    )
                })

                if limit > 0 and len(posts) >= limit:
                    return posts

            offset += batch_size

            time.sleep(0.35)

            if len(items) < batch_size:
                break

        return posts

    # ==================================================
    # COMMENTS FOR SINGLE POST
    # ==================================================

    def get_post_comments(
        self,
        owner_id: int,
        post_id: int,
        session_id: str
    ):

        comments = []

        offset = 0
        batch_size = 100

        while True:

            try:

                response = self.call(
                    "wall.getComments",
                    owner_id=owner_id,
                    post_id=post_id,
                    count=batch_size,
                    offset=offset,
                    thread_items_count=10
                )

            except Exception:
                break

            items = response.get("items", [])

            if not items:
                break

            for c in items:

                comments.append({

                    "id":
                        c["id"],

                    "post_id":
                        post_id,

                    "owner_id":
                        owner_id,

                    "session_id":
                        session_id,

                    "from_id":
                        c.get("from_id", 0),

                    "comment_date":
                        datetime.fromtimestamp(
                            c["date"]
                        ).isoformat(),

                    "comment_text":
                        c.get("text", ""),

                    "likes":
                        c.get(
                            "likes",
                            {}
                        ).get("count", 0),

                    "reply_to":
                        c.get(
                            "reply_to_comment",
                            0
                        )
                })

            offset += batch_size

            time.sleep(0.35)

            if len(items) < batch_size:
                break

        return comments

    # ==================================================
    # COMMENTS FOR SESSION
    # ==================================================

    def collect_comments_for_posts(
        self,
        posts,
        session_id
    ):

        all_comments = []

        total_posts = len(posts)

        for index, post in enumerate(posts, start=1):

            comments_count = post.get(
                "comments",
                0
            )

            if comments_count <= 0:
                continue

            comments = self.get_post_comments(
                owner_id=post["owner_id"],
                post_id=post["id"],
                session_id=session_id
            )

            all_comments.extend(comments)

            time.sleep(0.25)

        return all_comments