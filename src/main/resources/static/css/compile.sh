#!/bin/bash
cd src/main/resources/static/css
rm style.css || true
dart-sass --no-source-map style.scss style.css
