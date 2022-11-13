yarn install

yarn prisma migrate reset

rm /public/uploads/*

yarn build

pm2 restart fcsakev5 --update-env