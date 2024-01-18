#!/bin/sh
## mysqldump -uroot -p --opt timecards > sql/timecards.sql
scp -r ../s2gi root@sitebuilt.net:/home/services
scp -r ../s2gi root@parleyvale.com:/home/services
