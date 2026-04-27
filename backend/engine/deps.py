from ravioli_core.config import DbSettings
from ravioli_core.utils import create_engine_and_sessionmaker

# Database
engine, LocalSession = create_engine_and_sessionmaker(settings=DbSettings())
