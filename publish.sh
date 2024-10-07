#!/bin/bash

echo $VERSION

cd dist/bin/packages
cd datastores/nestjs-dmq-postgres/prisma/npm
sudo pnpm pack
cd ../../..
cd nestjs-dmq-repository/npm
sudo pnpm pack
cd ../..
cd core/npm
sudo pnpm pack
cd ../../../../

cd ~/GitHub/etk/dist/bin/packages
cd datastores/nestjs-dmq-postgres/prisma/npm
pnpm publish omedym-nestjs-dmq-datastore-client-postgres-$VERSION.tgz --access public --no-git-checks --dry-run

cd ../..
cd nestjs-dmq-repository/npm
pnpm publish omedym-nestjs-dmq-repository-$VERSION.tgz -access public --no-git-checks --dry-run

cd ../..
cd core/npm
pnpm publish omedym-nestjs-dmq-core-$VERSION.tgz -access public --no-git-checks --dry-run
cd ../../../../
