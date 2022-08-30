#!/usr/bin/env bash
if [[ -z "$CI" || "$CI" != true ]]; then
  git secrets --install -f
  git secrets --register-aws
fi
