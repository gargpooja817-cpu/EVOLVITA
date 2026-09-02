from datetime import datetime
from typing import Optional, Dict, Any
from database.db import get_db_connection

class UserService:
    @staticmethod
    def _row_to_dict(row) -> Optional[Dict[str, Any]]:
        if not row:
            return None
        return {
            "id": row["id"],
            "firebase_uid": row["firebase_uid"],
            "full_name": row["full_name"],
            "email": row["email"],
            "role": row["role"],
            "profile_completed": bool(row["profile_completed"]),
            "avatar": row["avatar"],
            "title": row["title"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"]
        }

    @classmethod
    def get_user_by_uid(cls, firebase_uid: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE firebase_uid = ?", (firebase_uid,))
        row = cursor.fetchone()
        conn.close()
        return cls._row_to_dict(row)

    @classmethod
    def get_user_by_email(cls, email: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        conn.close()
        return cls._row_to_dict(row)

    @classmethod
    def create_or_sync_user(
        cls, 
        firebase_uid: str, 
        email: str, 
        full_name: Optional[str] = None, 
        avatar: Optional[str] = None,
        role: Optional[str] = None
    ) -> Dict[str, Any]:
        existing = cls.get_user_by_uid(firebase_uid)
        now_str = datetime.utcnow().isoformat()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if existing:
            # Update fields if provided and not set
            updated_name = full_name if full_name is not None else existing["full_name"]
            updated_avatar = avatar if avatar is not None else existing["avatar"]
            updated_role = role if (role is not None and not existing["role"]) else existing["role"]
            
            cursor.execute("""
                UPDATE users 
                SET full_name = ?, avatar = ?, role = ?, updated_at = ?
                WHERE firebase_uid = ?
            """, (updated_name, updated_avatar, updated_role, now_str, firebase_uid))
            conn.commit()
            conn.close()
            return cls.get_user_by_uid(firebase_uid)
        else:
            # Check if there was an email match
            email_match = cls.get_user_by_email(email)
            if email_match:
                cursor.execute("""
                    UPDATE users 
                    SET firebase_uid = ?, full_name = COALESCE(?, full_name), avatar = COALESCE(?, avatar), updated_at = ?
                    WHERE email = ?
                """, (firebase_uid, full_name, avatar, now_str, email))
                conn.commit()
                conn.close()
                return cls.get_user_by_uid(firebase_uid)
            
            # Insert new user
            cursor.execute("""
                INSERT INTO users (firebase_uid, full_name, email, role, profile_completed, avatar, title, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                firebase_uid,
                full_name or email.split('@')[0].capitalize(),
                email,
                role,
                1 if role else 0,
                avatar or f"https://api.dicebear.com/7.x/initials/svg?seed={email}",
                "Workforce Professional",
                now_str,
                now_str
            ))
            conn.commit()
            conn.close()
            return cls.get_user_by_uid(firebase_uid)

    @classmethod
    def set_user_role(cls, firebase_uid: str, role: str) -> Optional[Dict[str, Any]]:
        user = cls.get_user_by_uid(firebase_uid)
        if not user:
            return None
            
        now_str = datetime.utcnow().isoformat()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        import urllib.parse
        encoded_email = urllib.parse.quote(user['email'] or 'user')
        avatar = user["avatar"] or f"https://api.dicebear.com/7.x/initials/svg?seed={encoded_email}"
        title = user["title"]
        if role.lower() == "recruiter":
            title = "Talent Acquisition"
        elif role.lower() == "candidate":
            title = "Candidate Profile"
                
        cursor.execute("""
            UPDATE users 
            SET role = ?, profile_completed = 1, avatar = ?, title = ?, updated_at = ?
            WHERE firebase_uid = ?
        """, (role.lower(), avatar, title, now_str, firebase_uid))
        conn.commit()
        conn.close()
        return cls.get_user_by_uid(firebase_uid)

    @classmethod
    def update_user_profile(cls, firebase_uid: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        user = cls.get_user_by_uid(firebase_uid)
        if not user:
            return None
            
        now_str = datetime.utcnow().isoformat()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        full_name = data.get("full_name", user["full_name"])
        title = data.get("title", user["title"])
        avatar = data.get("avatar", user["avatar"])
        
        cursor.execute("""
            UPDATE users 
            SET full_name = ?, title = ?, avatar = ?, updated_at = ?
            WHERE firebase_uid = ?
        """, (full_name, title, avatar, now_str, firebase_uid))
        conn.commit()
        conn.close()
        return cls.get_user_by_uid(firebase_uid)
