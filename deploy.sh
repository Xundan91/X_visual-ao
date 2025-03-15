
# ANT_PROCESS="sLjQLCqgCIaLiysxJNv4lz_qUfkIPma8-7jd8FyinWE"

# if [ -f "wallet.json" ]; then
#     export DEPLOY_KEY=$(base64 -i wallet.json)
# fi

# # replace the basePath in the next.config.mjs file
# sed -i '' 's/basePath: "\/visual-ao",/basePath: "",/' next.config.mjs
# pnpm build
# mv out dist
# permaweb-deploy --ant-process $ANT_PROCESS
# rm -rf dist

# # restore the basePath in the next.config.mjs file
# sed -i '' 's/basePath: "",/basePath: "\/visual-ao",/' next.config.mjs


# if [ -f "dist-errors.txt" ]; then
#     echo "Errors found in the build:"
#     cat dist-errors.txt
#     exit 1
# fi