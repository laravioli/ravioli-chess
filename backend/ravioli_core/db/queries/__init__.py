from pathlib import Path

from ravioli_core.db.sql_loader import generate_class_from_sql

current_folder = Path(__file__).resolve().parent

# NOTE uv run stubgen -m ravioli_core.db.queries --inspect-mode --export-less -o .
# NOTE to generate .pyi query types

UserQueries = generate_class_from_sql(current_folder / "user.sql", "UserQueries", __name__)
NotifQueries = generate_class_from_sql(current_folder / "notif.sql", "NotifQueries", __name__)
WebQueries = generate_class_from_sql(current_folder / "web.sql", "WebQueries", __name__)
SocialQueries = generate_class_from_sql(current_folder / "social.sql", "SocialQueries", __name__)
ChallQueries = generate_class_from_sql(current_folder / "challenge.sql", "ChallQueries", __name__)
