#!/bin/sh
## mysqldump -uroot -p --opt timecards > sql/timecards.sql
## scp -r ../timecards root@sitebuilt.net:/home/services
## scp -r ../timecards root@parleyvale.com:/home/services

rsync -av -e ssh --exclude='node_modules' --exclude='package-lock.json' ../timecards/ root@parleyvale.com:/home/services/timecards
rsync -av -e ssh --exclude='node_modules' --exclude='package-lock.json' ../timecards/ root@apps.sitebuilt.net:/home/servers/timecards
rsync -av -e ssh --exclude='node_modules' --exclude='package-lock.json' ../timecards/ root@sitebuilt.net:/home/services/timecards
