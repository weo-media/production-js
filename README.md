# WEO-Test-js
JS files for WEO Media web project testing

if &devops=1 in url and [[[script:weo-github|||repo/folder/file.js]]] => https://cdn.jsdelivr.net/gh/weo-media/weo-test-js/previeweo/filter-sort.js
if &devops=1&branch=branchName in url and [[[script:weo-github|||repo/folder/file.js]]] => https://cdn.jsdelivr.net/gh/weo-media/weo-test-js@branchName/previeweo/filter-sort.js
else file.js file in client folder => https://www.weo2.com/tpn/c/C777/docs/file.js

-----------------------------------------

in the end, if the key looks like:
[[[script:weo-github|||repo/folder/file.js]]]

and your url looks like this:
https://www.weomedia.com/p/dental-marketing-QL-Designs-2021-Test-page-p18450.asp?Preview=1&devops=1&branch=***20210126-branch***

you will get the ***20210126-branch version***

-----------------------------------------

if the key looks like:
[[[script:weo-github]]]

and your url looks like this:
https://www.weomedia.com/p/dental-marketing-QL-Designs-2021-Test-page-p18450.asp?Preview=1&devops=1&branch=20210126-branch

you will get ***nothing***

-------------------------------------------

if the key looks like:
[[[script:weo-github|||file.js]]]

and your url looks like this:
https://www.weomedia.com/p/dental-marketing-QL-Designs-2021-Test-page-p18450.asp?Preview=1&devops=1&branch=20210126-branch

you will get an ***error***

-------------------------------------------

if the key looks like:
[[[script:weo-github|||file.js]]]

and your url looks like this:
https://www.weomedia.com/p/dental-marketing-QL-Designs-2021-Test-page-p18450.asp?Preview=1

you will get the ***client folder version***

-------------------------------------------

if the key looks like:
[[[script:weo-github|||repo/folder/file.js]]]

and your url looks like this:
https://www.weomedia.com/p/dental-marketing-QL-Designs-2021-Test-page-p18450.asp?Preview=1

you will get the ***client folder version***

-------------------------------------------

if the key looks like:
[[[script:weo-github|||repo/folder/file.js]]]

and your url looks like this:
https://www.weomedia.com/p/dental-marketing-QL-Designs-2021-Test-page-p18450.asp?Preview=1&***devops=1***

you will get the ***main/master branch version***

-------------------------------------------
