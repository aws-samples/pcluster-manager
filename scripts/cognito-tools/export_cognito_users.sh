#!/bin/bash -e


function print_help() {
  echo "Usage $0 --region REGION [--user-pool-id USER_POOL_ID]"
}

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -h)
    print_help  >&2
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

    *)    # unknown option
    print_help  >&2
    exit 1
    ;;
esac
done


. common.sh

check_region
check_user_pool_id

aws cognito-idp list-users --region "$REGION" --user-pool-id $USER_POOL_ID --query "Users[].{email: Attributes[?Name == 'email'].Value | [0]}" --output text | while read USERNAME
do
  USER_GROUPS=$(aws cognito-idp admin-list-groups-for-user --username "$USERNAME" --user-pool-id "$USER_POOL_ID" --region "$REGION" --query 'Groups[*].GroupName' --output text | tr -s '\t' ',')
  echo "$USERNAME|$USER_GROUPS"
done
