#!/bin/bash
# Pulls the most recent files from Kaffeine at https://github.com/KDE/kaffeine
rm -rf src/main/cpp
mkdir -p src/main/cpp
cd src/main/cpp
wget https://github.com/KDE/kaffeine/archive/refs/heads/master.tar.gz
tar xz -f master.tar.gz
rm master.tar.gz
