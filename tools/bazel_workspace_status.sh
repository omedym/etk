#!/bin/bash

# This script will be run bazel when building process starts to
# generate key-value information that represents the status of the
# workspace. The output should be like
#
# KEY1 VALUE1
# KEY2 VALUE2
#
# If the script exits with non-zero code, it's considered as a failure
# and the output will be discarded.

set -eo pipefail # exit immediately if any command fails.

function remove_url_credentials() {
	which perl >/dev/null && perl -pe 's#//.*?:.*?@#//#' || cat
}

repo_url=$(git config --get remote.origin.url | remove_url_credentials)
echo "REPO_URL $repo_url"

commit_sha=$(git rev-parse HEAD | cut -c 1-8)
echo "COMMIT_SHA $commit_sha"

if [ -n "${IMAGE_TAG}" ]; then
	echo "IMAGE_TAG $IMAGE_TAG"
elif [ -n "${STACK}" ]; then
	git_branch=$(echo $STACK | sed 's/[a-z]/\U&/g')
	echo "IMAGE_TAG $git_branch-$commit_sha"
elif [ -n "${NAMESPACE}" ]; then
	git_branch=$(echo $NAMESPACE | sed 's/[a-z]/\U&/g')
	echo "IMAGE_TAG $git_branch-$commit_sha"
elif [ -n "${BRANCH}" ]; then
	git_branch=$(echo $BRANCH | sed 's/[a-z]/\U&/g')
	echo "IMAGE_TAG $git_branch-$commit_sha"
else
	git_branch=$(git rev-parse --abbrev-ref HEAD)
	echo "IMAGE_TAG $git_branch-$commit_sha"
fi

git_tree_status=$(git diff-index --quiet HEAD -- && echo 'Clean' || echo 'Modified')
echo "GIT_TREE_STATUS $git_tree_status"

echo "CURRENT_TIME $(date +%s)"
echo "STABLE_GIT_COMMIT $(git rev-parse HEAD)"
echo "STABLE_SHORT_GIT_COMMIT $(git rev-parse HEAD | cut -c 1-8)"
echo "STABLE_USER_NAME $USER"
