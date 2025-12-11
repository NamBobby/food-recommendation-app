#!/usr/bin/env python
import os
import subprocess
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Constants
DATA_DIR = Path(__file__).parent.parent / "data"
SQL_FILE = DATA_DIR / "database.sql"
DATA_DIR.mkdir(exist_ok=True)

def parse_mysql_url(db_url):
    """Parse MySQL URL of format mysql://user:password@host:port/db"""
    if not db_url.startswith("mysql://"):
        raise ValueError("Invalid MySQL connection string")

    tmp = db_url.replace("mysql://", "")

    auth, host_db = tmp.split("@")
    user, password = auth.split(":")

    host_part, db = host_db.split("/")
    if ":" in host_part:
        host, port = host_part.split(":")
    else:
        host = host_part
        port = "3306"

    return {
        "user": user,
        "password": password,
        "host": host,
        "port": port,
        "dbname": db
    }

def export_database():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL missing.")
        return False

    db = parse_mysql_url(db_url)

    cmd = [
        "mysqldump",
        f"-h{db['host']}",
        f"-P{db['port']}",
        f"-u{db['user']}",
        f"-p{db['password']}",
        db["dbname"]
    ]

    with open(SQL_FILE, "w") as f:
        result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)

    if result.returncode != 0:
        print(f"❌ Export error: {result.stderr}")
        return False

    print(f"✅ Exported to {SQL_FILE}")
    return True

def import_database():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL missing.")
        return False

    if not SQL_FILE.exists():
        print("❌ SQL file does not exist.")
        return False

    db = parse_mysql_url(db_url)

    cmd = [
        "mysql",
        f"-h{db['host']}",
        f"-P{db['port']}",
        f"-u{db['user']}",
        f"-p{db['password']}",
        db["dbname"]
    ]

    with open(SQL_FILE, "r") as f:
        result = subprocess.run(cmd, stdin=f, stderr=subprocess.PIPE, text=True)

    if result.returncode != 0:
        print(f"❌ Import error: {result.stderr}")
        return False

    print(f"✅ Imported from {SQL_FILE}")
    return True

def check_db_exists():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL missing.")
        return False

    db = parse_mysql_url(db_url)

    cmd = [
        "mysql",
        f"-h{db['host']}",
        f"-P{db['port']}",
        f"-u{db['user']}",
        f"-p{db['password']}",
        "-e",
        "SHOW DATABASES;"
    ]

    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    if db["dbname"] in result.stdout:
        print(f"✅ Database '{db['dbname']}' exists.")
        return True

    print(f"⚠️ Database '{db['dbname']}' not found. Creating...")

    create_cmd = [
        "mysqladmin",
        f"-h{db['host']}",
        f"-P{db['port']}",
        f"-u{db['user']}",
        f"-p{db['password']}",
        "create",
        db["dbname"]
    ]

    result = subprocess.run(create_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    if result.returncode != 0:
        print(f"❌ Error creating database: {result.stderr}")
        return False

    print(f"✅ Database '{db['dbname']}' created.")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["export", "import", "check"])
    args = parser.parse_args()

    if args.action == "export":
        export_database()
    elif args.action == "import":
        import_database()
    elif args.action == "check":
        check_db_exists()
