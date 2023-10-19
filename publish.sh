#!/bin/bash

echo $VERSION

cd dist/bin/packages
cd repository-postgres-client/npm
sudo pnpm pack
cd ../..
cd repository-postgres/npm
sudo pnpm pack
cd ../..
cd core/npm
sudo pnpm pack
cd ../../../../

cd ~/GitHub/nestjs-dmq/dist/bin/packages
cd repository-postgres-client/npm
pnpm publish omedym-nestjs-dmq-repository-postgres-client-$VERSION.tgz --access public --no-git-checks --dry-run

cd ../..
cd repository-postgres/npm
pnpm publish omedym-nestjs-dmq-repository-postgres-$VERSION.tgz -access public --no-git-checks --dry-run

cd ../..
cd core/npm
pnpm publish omedym-nestjs-dmq-core-$VERSION.tgz -access public --no-git-checks --dry-run
cd ../../../../
