yarn install

rm -rf uploads

yarn prisma migrate reset --force

rm /uploads/*

yarn build

pm2 restart healthsake --update-env

mkdir uploads
