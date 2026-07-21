"""DDL challenge

Revision ID: 435cdb917fa3
Revises: 6450d5751f55
Create Date: 2026-07-02 01:19:07.206102

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '435cdb917fa3'
down_revision: Union[str, Sequence[str], None] = '6450d5751f55'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('challenge',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('challenge_id', sa.String(length=8), nullable=False),
    sa.Column('sender_id', sa.Uuid(), nullable=True),
    sa.Column('receiver_id', sa.Uuid(), nullable=True),
    sa.Column('status', sa.Enum('created', 'canceled', 'declined', 'accepted', name='challengestatus'), nullable=False),
    sa.Column('color_choice', sa.Enum('rand', 'w', 'b', name='chesscolorchoice'), nullable=False),
    sa.Column('color', sa.Enum('w', 'b', name='chesscolor'), nullable=False),
    sa.Column('initial_fen', sa.String(length=100), nullable=False),
    sa.Column('pub_date', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('expire_at', sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP + INTERVAL '7 days'"), nullable=False),
    sa.Column('time_control', sa.String(length=10), nullable=True),
    sa.CheckConstraint('sender_id <> receiver_id', name=op.f('ck_challenge_`challenge_no_self_challenge`')),
    sa.CheckConstraint('sender_id IS NOT NULL OR receiver_id IS NULL', name=op.f('ck_challenge_`challenge_sender_required_for_receiver`')),
    sa.ForeignKeyConstraint(['receiver_id'], ['user_account.id'], name=op.f('fk_challenge_receiver_id_user_account'), ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['sender_id'], ['user_account.id'], name=op.f('fk_challenge_sender_id_user_account'), ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_challenge'))
    )
    op.create_index(op.f('ix_challenge_challenge_id'), 'challenge', ['challenge_id'], unique=True)
    op.create_index(op.f('ix_challenge_expire_at'), 'challenge', ['expire_at'], unique=False)
    op.create_index(op.f('ix_challenge_receiver_id'), 'challenge', ['receiver_id'], unique=False)
    op.create_index(op.f('ix_challenge_sender_id'), 'challenge', ['sender_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_challenge_sender_id'), table_name='challenge')
    op.drop_index(op.f('ix_challenge_receiver_id'), table_name='challenge')
    op.drop_index(op.f('ix_challenge_expire_at'), table_name='challenge')
    op.drop_index(op.f('ix_challenge_challenge_id'), table_name='challenge')
    op.drop_table('challenge')
    op.execute("DROP TYPE challengestatus")
    op.execute("DROP TYPE chesscolorchoice")
    op.execute("DROP TYPE chesscolor")
