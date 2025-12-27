import bcrypt
import hashlib
import secrets


def hash_password(password: str) -> str:
    # Convert password to bytes
    password_bytes = password.encode('utf-8')
    
    # Generate salt and hash the password
    # 10 rounds matches the Node.js implementation
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Return as string (bcrypt returns bytes)
    return hashed.decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    # Convert both to bytes
    password_bytes = password.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    
    # Verify the password
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def hash_token(data: str) -> str:
    return hashlib.sha256(data.encode('utf-8')).hexdigest()


def generate_token(num_bytes: int = 32) -> str:
    return secrets.token_hex(num_bytes)


def verify_token(input_token: str, stored_hash: str) -> bool:
    return hash_token(input_token) == stored_hash
