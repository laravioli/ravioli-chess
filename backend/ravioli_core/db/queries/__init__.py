from pathlib import Path

from ravioli_core.db.sql_loader import generate_class_from_sql

current_folder = Path(__file__).resolve().parent

# NOTE uv run stubgen -m ravioli_core.db.queries --inspect-mode --export-less -o .
# NOTE to generate .pyi query types

UserQueries = generate_class_from_sql(current_folder / "user.sql", "UserQueries", __name__)
PrefQueries = generate_class_from_sql(current_folder / "pref.sql", "PrefQueries", __name__)
