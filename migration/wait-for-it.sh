#!/usr/bin/env bash
# wait-for-it.sh script

host="$1"
shift
port="$1"
shift
timeout="${1:-15}"

echo "Waiting for $host:$port..."
for i in $(seq $timeout); do
    nc -z "$host" "$port" && break
    sleep 1
done
echo "$host:$port is available!"
exec "$@"
