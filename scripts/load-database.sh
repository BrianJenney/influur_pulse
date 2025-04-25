#!/bin/bash

BASEDIR=$(dirname "$0")

# Prompt for input
read -p "Local database name (default: influur)> " local_db_name
read -p "Remote db user (default: influur)> " remote_db_user
read -p "Remote db password> " remote_db_password
read -p "Local root password> " local_root_password

# Set defaults if empty
local_db_name=${local_db_name:-influur}
remote_db_user=${remote_db_user:-influur}

# Define Remote DB connection
remote_db_host="i-prod-read-replica.czqnsguxqh2n.us-east-1.rds.amazonaws.com"
remote_db_name="influur"

# Output file
dump_file="$BASEDIR/output/mysqldump.sql"

# Ensure output folder exists
mkdir -p "$BASEDIR/output"

echo "🔄 Dumping remote DB..."
# Dump from remote MySQL database
mysqldump -h "$remote_db_host" -u "$remote_db_user" -p"$remote_db_password" "$remote_db_name" > "$dump_file"

echo "🔧 Preparing local database..."
# Create local database if it doesn't exist
mysql -u root -p"$local_root_password" -e "CREATE DATABASE IF NOT EXISTS \`$local_db_name\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "🚀 Importing into local DB..."
# Import dump into local database
mysql -u root -p"$local_root_password" "$local_db_name" < "$dump_file"

echo "✅ Done! Remote database has been copied into your local DB: $local_db_name"