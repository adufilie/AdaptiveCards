#!/bin/bash
set -e\

git reset --soft master
rm -rf source
git checkout master -- source
echo "<script>window.location = \"source/nodejs/adaptivecards-visualizer\"</script>" > index.html
touch .nojekyll # enables publishing node_modules

pushd source/nodejs/adaptivecards
	npm install
	npm run build
popd

pushd source/nodejs/adaptivecards-visualizer
	npm install adaptivecards@../adaptivecards
	npm install
	npm run build-all
	pushd node_modules
		git add -f adaptivecards/dist monaco-editor/min/vs monaco-editor/min-maps/vs ../dist
	popd
popd

git add .
git commit -m "gh-pages"
git push -f

git checkout master
rm -rf source
git checkout master -- source

