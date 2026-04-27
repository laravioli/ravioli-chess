"""fix_friendship_unique_index

Revision ID: db2de2197739
Revises: a43f37c0e5c1
Create Date: 2026-04-17 01:02:55.780074

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'db2de2197739'
down_revision: Union[str, Sequence[str], None] = 'a43f37c0e5c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_index('ix_unique_friendship', table_name='friendship')
    op.create_index('ix_unique_friendship', 'friendship', [sa.literal_column("least(sender_id, receiver_id)"), sa.literal_column("greatest(sender_id, receiver_id)")], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_unique_friendship', table_name='friendship')
    op.create_index('ix_unique_friendship', 'friendship', [sa.literal_column("least('sender_id', 'receiver_id')"), sa.literal_column("greatest('sender_id', 'receiver_id')")], unique=True)

