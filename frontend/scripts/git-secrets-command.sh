#!/bin/sh

# The following script checks if git-secrets is installed on a local machine.
# If not, it prints an error message pointing to the official awslabs git-secrets repository.
# If yes, it executes the 'git-secrets' command with the argument(s) passed to the script.
#
# Usage: 
#   get-secrets-command.sh [COMMAND]
#
# Examples:
#   $ get-secrets-command.sh '--register-aws > /dev/null'
#   $ get-secrets-command.sh '--pre_commit_hook -- "$@"'
#

if [ -z "${CI}" ] || [ "${CI}" != true ]; then
  if ! command -v git-secrets >/dev/null 2>&1; then
      echo "git-secrets is not installed. Please visit https://github.com/awslabs/git-secrets#installing-git-secrets"
      exit 1
  fi
  
  _command="git-secrets $@"
  eval "$_command"
fi
