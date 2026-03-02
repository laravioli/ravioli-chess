from app.auth.deps import current_user_or_anon

user_or_anon_with_pref = current_user_or_anon(with_pref=True)
