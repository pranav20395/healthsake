yarn install

rm -rf uploads

yarn prisma migrate reset --force

rm /uploads/*

yarn build

pm2 restart fcsakev5 --update-env

mkdir uploads