from pathlib import Path

from .exceptions import SQLLoadException
from .parser import QueryData, parse_sql_to_queries


def generate_class_from_sql(
    file_path: str | Path, class_name: str, module_name: str, encoding=None
):
    path = Path(file_path)
    if not (path.exists() and path.is_file()):
        raise SQLLoadException(f"File does not exist: {path}")
    queries = _load_queries_from_sql(path, encoding=encoding)
    return _new_query_class(class_name, module_name, queries)


def _new_query_class(class_name: str, module_name: str, queries: list[QueryData]):
    class_attributes = {q.name: q.sql for q in queries}
    class_annotations = dict.fromkeys(class_attributes, str)

    new_class = type(class_name, (object,), class_attributes)
    new_class.__annotations__ = class_annotations
    new_class.__module__ = module_name
    return new_class


def _load_queries_from_sql(path: Path, encoding=None):
    sql = path.read_text(encoding=encoding)
    return parse_sql_to_queries(sql, path)
