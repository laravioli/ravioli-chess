import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "game.backend.settings")

import django

django.setup(set_prefix=False)


if __name__ == "__main__":
    pass
