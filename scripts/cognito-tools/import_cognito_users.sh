#!/bin/bash -e

function print_help() {
  echo "Usage $0 --region REGION --users-export-file PATH [--user-pool-id USER_POOL_ID --temp-pwd TEMP_PASSWORD]"
}

TEMP_PWD='P@ssw0rd'

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -h)
    print_help 1>&2
    exit 1
    ;;

    --user-pool-id)
    USER_POOL_ID="$2"
    shift
    shift
    ;;

    --region)
    REGION=$2
    shift
    shift
    ;;

    --temp-pwd)
    TEMP_PWD=$2
    shift
    shift
    ;;

    --users-export-file)
    FILE=$2
    shift
    shift
    ;;

    *)    # unknown option
    print_help  >&2
    exit 1
    ;;
esac
done

. common.sh

check_region
check_user_pool_id

if [ -z "$FILE" ]; then
  echo "Users export file is required. Exiting" 1>&2
  exit 1
fi

cat "$FILE" | while read LINE; do
  EMAIL="$(echo "$LINE" | cut -d '|' -f 1)"
  USER_GROUPS="$(echo "$LINE" | cut -d '|' -f 2)"

  echo "Creating user $EMAIL with groups $USER_GROUPS"
  aws cognito-idp admin-create-user --region "$REGION" --user-pool-id "$USER_POOL_ID" --username "$EMAIL" --temporary-password "$TEMP_PWD" --user-attributes Name=email,Value="$EMAIL" Name=email_verified,Value=true > /dev/null
  echo $USER_GROUPS | tr ',' '\n' | while read USER_GROUP
  do
    aws cognito-idp admin-add-user-to-group --region "$REGION" --user-pool-id "$USER_POOL_ID" --username "$EMAIL" --group-name $USER_GROUP
  done
done


echo "All done"
