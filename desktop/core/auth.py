class Auth:
    token: str | None = None
    user: dict = {}

    @classmethod
    def set(cls, token: str, user: dict) -> None:
        cls.token = token
        cls.user = user

    @classmethod
    def clear(cls) -> None:
        cls.token = None
        cls.user = {}

    @classmethod
    def is_authenticated(cls) -> bool:
        return cls.token is not None

    @classmethod
    def get_role(cls) -> str:
        return cls.user.get("role", "")
