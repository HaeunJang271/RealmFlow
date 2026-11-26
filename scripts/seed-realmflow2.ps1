# Set these values before copying individual registration commands. Each command broadcasts a transaction.
$key = 'YOUR_KEY'
$rpc = 'https://rpc.latest.testnets.gno.land:443'
$registry = 'gno.land/r/g1832jd5gytypzj48d0328r2sqvv2x38zj0zryuq/realmflow2'

# Gno.land Blog Smoke Test
gnokey maketx call -pkgpath $registry -func RegisterScenario -args 'Gno.land Blog Smoke Test' -args 'gno.land/r/gnoland/blog' -args 'eyJ0aXRsZSI6Ikduby5sYW5kIEJsb2cgU21va2UgVGVzdCIsInJlYWxtIjoiZ25vLmxhbmQvci9nbm9sYW5kL2Jsb2ciLCJzdGVwcyI6W3sibmFtZSI6Ikduby5sYW5kIEJsb2cgU21va2UgVGVzdCIsIm1vZGUiOiJxZXZhbCIsInJlYWxtIjoiZ25vLmxhbmQvci9nbm9sYW5kL2Jsb2ciLCJmdW5jIjoiUmVuZGVyIiwiYXJncyI6WyIiXSwidHlwZXMiOlsic3RyaW5nIl0sImV4cGVjdGVkIjoiIn1dfQ' -gas-fee 2000ugnot -gas-wanted 3000000 -chainid onyx-1 -remote $rpc -broadcast $key

# GovDAO Governance Check
gnokey maketx call -pkgpath $registry -func RegisterScenario -args 'GovDAO Governance Check' -args 'gno.land/r/gov/dao' -args 'eyJ0aXRsZSI6IkdvdkRBTyBHb3Zlcm5hbmNlIENoZWNrIiwicmVhbG0iOiJnbm8ubGFuZC9yL2dvdi9kYW8iLCJzdGVwcyI6W3sibmFtZSI6IkdvdkRBTyBHb3Zlcm5hbmNlIENoZWNrIiwibW9kZSI6InFldmFsIiwicmVhbG0iOiJnbm8ubGFuZC9yL2dvdi9kYW8iLCJmdW5jIjoiUmVuZGVyIiwiYXJncyI6WyIiXSwidHlwZXMiOlsic3RyaW5nIl0sImV4cGVjdGVkIjoiIn1dfQ' -gas-fee 2000ugnot -gas-wanted 3000000 -chainid onyx-1 -remote $rpc -broadcast $key

# Users Registry Lookup
gnokey maketx call -pkgpath $registry -func RegisterScenario -args 'Users Registry Lookup' -args 'gno.land/r/sys/users' -args 'eyJ0aXRsZSI6IlVzZXJzIFJlZ2lzdHJ5IExvb2t1cCIsInJlYWxtIjoiZ25vLmxhbmQvci9zeXMvdXNlcnMiLCJzdGVwcyI6W3sibmFtZSI6IlVzZXJzIFJlZ2lzdHJ5IExvb2t1cCIsIm1vZGUiOiJxZXZhbCIsInJlYWxtIjoiZ25vLmxhbmQvci9zeXMvdXNlcnMiLCJmdW5jIjoiUmVuZGVyIiwiYXJncyI6WyIiXSwidHlwZXMiOlsic3RyaW5nIl0sImV4cGVjdGVkIjoiIn1dfQ' -gas-fee 2000ugnot -gas-wanted 3000000 -chainid onyx-1 -remote $rpc -broadcast $key

# RealmFlow Registry Self-Check
gnokey maketx call -pkgpath $registry -func RegisterScenario -args 'RealmFlow Registry Self-Check' -args 'gno.land/r/g1832jd5gytypzj48d0328r2sqvv2x38zj0zryuq/realmflow2' -args 'eyJ0aXRsZSI6IlJlYWxtRmxvdyBSZWdpc3RyeSBTZWxmLUNoZWNrIiwicmVhbG0iOiJnbm8ubGFuZC9yL2cxODMyamQ1Z3l0eXB6ajQ4ZDAzMjhyMnNxdnYyeDM4emowenJ5dXEvcmVhbG1mbG93MiIsInN0ZXBzIjpbeyJuYW1lIjoiUmVhbG1GbG93IFJlZ2lzdHJ5IFNlbGYtQ2hlY2siLCJtb2RlIjoicWV2YWwiLCJyZWFsbSI6Imduby5sYW5kL3IvZzE4MzJqZDVneXR5cHpqNDhkMDMyOHIyc3F2djJ4Mzh6ajB6cnl1cS9yZWFsbWZsb3cyIiwiZnVuYyI6IkdldFNjZW5hcmlvQ291bnQiLCJhcmdzIjpbXSwidHlwZXMiOltdLCJleHBlY3RlZCI6IiJ9XX0' -gas-fee 2000ugnot -gas-wanted 3000000 -chainid onyx-1 -remote $rpc -broadcast $key

# Multi-Step Variable Chaining Demo
gnokey maketx call -pkgpath $registry -func RegisterScenario -args 'Multi-Step Variable Chaining Demo' -args 'gno.land/r/g1832jd5gytypzj48d0328r2sqvv2x38zj0zryuq/realmflow2' -args 'eyJ0aXRsZSI6Ik11bHRpLVN0ZXAgVmFyaWFibGUgQ2hhaW5pbmcgRGVtbyIsInJlYWxtIjoiZ25vLmxhbmQvci9nMTgzMmpkNWd5dHlwemo0OGQwMzI4cjJzcXZ2MngzOHpqMHpyeXVxL3JlYWxtZmxvdzIiLCJzdGVwcyI6W3sibmFtZSI6IkdldCBzY2VuYXJpbyBjb3VudCIsIm1vZGUiOiJxZXZhbCIsInJlYWxtIjoiZ25vLmxhbmQvci9nMTgzMmpkNWd5dHlwemo0OGQwMzI4cjJzcXZ2MngzOHpqMHpyeXVxL3JlYWxtZmxvdzIiLCJmdW5jIjoiR2V0U2NlbmFyaW9Db3VudCIsImFyZ3MiOltdLCJ0eXBlcyI6W10sImV4cGVjdGVkIjoiIn0seyJuYW1lIjoiUmVuZGVyIHdpdGggc3RlcCAxIG91dHB1dCIsIm1vZGUiOiJxZXZhbCIsInJlYWxtIjoiZ25vLmxhbmQvci9nbm9sYW5kL2Jsb2ciLCJmdW5jIjoiUmVuZGVyIiwiYXJncyI6WyJ7e3N0ZXAxLm91dHB1dH19Il0sInR5cGVzIjpbInN0cmluZyJdLCJleHBlY3RlZCI6IiJ9XX0' -gas-fee 2000ugnot -gas-wanted 3000000 -chainid onyx-1 -remote $rpc -broadcast $key
