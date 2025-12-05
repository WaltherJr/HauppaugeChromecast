#!/bin/bash
cd src/main/resources/static/css
rm style.css
dart-sass --no-source-map style.scss style.css
