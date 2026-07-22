import logging
import re
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

from .exceptions import SQLParseException

logger = logging.getLogger(__name__)


# identifies name definition comments
_QUERY_DEF = re.compile(r"--\s*name\s*:\s*")

# extracting comments requires some kind of scanner
_UNCOMMENT = re.compile(
    # single quote strings
    r"(?P<squote>\'(\'\'|[^\'])*\')|"
    # double quote strings
    r'(?P<dquote>"(""|[^"])+")|'
    # one-line comment
    r"(?P<oneline>--.*?$)|"
    # multiline comments, excluding SQL hints
    r"|(?P<multiline>/\*(?!\+[\s\S]*?\*/)[\s\S]*?\*/)",
    re.DOTALL | re.MULTILINE,
)

# get SQL comment contents
_SQL_COMMENT = re.compile(r"\s*--\s*(.*)$")


@dataclass(frozen=True, kw_only=True)
class QueryData:
    name: str
    sql: str
    doc: str
    floc: tuple[Path | str, int]


def parse_sql_to_queries(sql: str, file_name: Path | str = "<unknown>"):
    """Load queries from a string."""
    uncommented_sql = _remove_ml_comments(sql)
    qdefs = _QUERY_DEF.split(uncommented_sql)
    # lineno is from the uncommented file, fix it
    lineno = 1 + qdefs[0].count("\n")
    queries: list[QueryData] = []
    # first item is anything before the first query definition, drop it!
    for qdef in qdefs[1:]:
        queries.append(_make_query_data(qdef, (file_name, lineno)))
        lineno += qdef.count("\n")
    return queries


def _make_query_data(
    query: str,
    floc: tuple[Path | str, int],
):
    lines = [line.rstrip() for line in query.strip().splitlines()]
    query_name = lines[0].replace("-", "_")
    if re.search(r"[^A-Za-z0-9_]", query_name):
        logger.warning(f"non ASCII character in query name: {query_name}")
    if len(lines) <= 1:
        raise SQLParseException(f"empty query for: {query_name} at {floc[0]}:{floc[1]}")
    sql, doc = _get_sql_doc(lines[1:])
    if re.search("(?s)^[\t\n\r ;]*$", sql):
        raise SQLParseException(f"empty sql for: {query_name} at {floc[0]}:{floc[1]}")
    return QueryData(name=query_name, sql=sql, doc=doc, floc=floc)


def _remove_ml_comments(code: str):
    """Remove /* ... */ comments from code"""
    # identify commented regions to be removed
    rm = []
    for m in _UNCOMMENT.finditer(code):
        ml = m.groupdict()["multiline"]
        if ml:
            rm.append(m.span())
    # keep whatever else
    ncode, current = "", 0
    for start, end in rm:
        ncode += code[current:start]
        current = end
    # get tail
    ncode += code[current:]
    return ncode


def _get_sql_doc(lines: Sequence[str]) -> tuple[str, str]:
    """Separate SQL-comment documentation and SQL code."""
    doc, sql = "", ""
    for line in lines:
        doc_match = _SQL_COMMENT.match(line)
        if doc_match:
            doc += doc_match.group(1) + "\n"
        else:
            sql += line + "\n"

    return sql.strip(), doc.rstrip()
