RED='\033[0;31m'
NC='\033[0m'

check_region() {
  if [ -z $REGION ]; then
    echo -e "${RED}Region is not set. Exiting${NC}" 1>&2
    exit 1
  fi
}

get_user_pool_id() {
  aws cognito-idp list-user-pools --region "$REGION" --max-results 1 --query 'UserPools[0].Id' --output text
}

check_user_pool_id() {
  if [ -z $USER_POOL_ID ]; then
    echo -e "${RED}Cognito user pool id is NOT set, using first user pool returned by the query${NC}" 1>&2
    USER_POOL_ID=`get_user_pool_id`
  fi
}
