#!/bin/bash

echo $1

for doc in $1/*; do
	name=$(basename $doc)
	if [[ "${name#*.}" == "js" ]]; then
		mv "$doc" "$1/${name%%.*}.jsx"
		echo "$1${name%%.*}"
	fi
done
