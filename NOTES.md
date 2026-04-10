## Steps

Step 1. Follow [https://docs.github.com/en/get-started/using-git/splitting-a-subfolder-out-into-a-new-repository?platform=linux](https://docs.github.com/en/get-started/using-git/splitting-a-subfolder-out-into-a-new-repository?platform=linux), copy `git-filter-repo` to `~/.nvm/versions/node/v20.19.2/bin`.

Step 2. Run
```
cd ~/project/k2/hx
rm -rf ./public
git commit -am 'Remove ./public'
git push
```
and follow [https://git-scm.com/book/en/v2/Git-Tools-Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules).

Step 3. Follow [https://betterstack.com/community/guides/testing/ava-unit-testing/](https://betterstack.com/community/guides/testing/ava-unit-testing/)
