#!/usr/bin/env bash

# Get the project directory
PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)

# Check if we're on Catalina or later
if [ -d "/System/Volumes/Data" ]; then
  # macOS Catalina and later
  if [[ "$PROJECT_DIR" == /System/Volumes/Data/* ]]; then
    # Project is already in /System/Volumes/Data
    PROJECT_RELATIVE_PATH=${PROJECT_DIR#/System/Volumes/Data}
    echo ":/System/Volumes/Data${PROJECT_RELATIVE_PATH}"
  else
    # Project is in /Users or elsewhere
    PROJECT_RELATIVE_PATH=${PROJECT_DIR#/Users}
    echo ":/System/Volumes/Data/Users${PROJECT_RELATIVE_PATH}"
  fi
else
  # Pre-Catalina macOS
  PROJECT_RELATIVE_PATH=${PROJECT_DIR#/Users}
  echo ":/Users${PROJECT_RELATIVE_PATH}"
fi

