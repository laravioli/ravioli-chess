from pathlib import Path

from .exceptions import SQLLoadException
from .parser import QueryData, parse_sql_to_query_data


class Queries:
    def add_query(self, q: QueryData):
        if hasattr(self, q.name):
            raise SQLLoadException(f"cannot override existing attribute with query: {q.name}")
        setattr(self, q.name, q.sql)

    def load_from_list(self, query_data: list[QueryData]):
        for q in query_data:
            self.add_query(q)
        return self


def sql_from_file(sql_path: str | Path, encoding=None):
    path = Path(sql_path)
    if not (path.exists() and path.is_file()):
        raise SQLLoadException(f"File does not exist: {path}")
    query_data = _load_query_data_from_file(path, encoding=encoding)
    return Queries().load_from_list(query_data)


def _load_query_data_from_file(path: Path, encoding=None):
    sql = path.read_text(encoding=encoding)
    return parse_sql_to_query_data(sql, path)
