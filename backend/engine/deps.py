from ravioli_service.config import DbSettings
from ravioli_service.utils import create_engine_and_sessionmaker

# Database
engine, LocalSession = create_engine_and_sessionmaker(settings=DbSettings())
