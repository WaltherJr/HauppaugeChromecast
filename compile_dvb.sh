cd src/main/cpp/kaffeine-master/src
export CPLUS_INCLUDE_PATH=/usr/include/x86_64-linux-gnu/qt6/QtCore/:/usr/include/x86_64-linux-gnu/qt6/QtSql:/usr/include/x86_64-linux-gnu/qt6/QtWidgets/:/usr/include/x86_64-linux-gnu/qt6/:/usr/include/x86_64-linux-gnu/qt6/QtGui/:$CPLUS_INCLUDE_PATH
echo "HELLO!"
# g++ -fPIC -I/usr/include/KF5/KConfigCore -I/usr/include/KF5/KConfigGui -I/usr/include/KF5/KI18n -I/usr/include/KF5/KIOCore -I/usr/include/KF5/KXmlGui/ -I/usr/include/KF5/KConfigWidgets -I/usr/include/KF5/KWidgetsAddons -c dvb/*.cpp
g++ -fPIC -I/usr/include/KF5/KConfigCore -I/usr/include/KF5/KConfigGui -I/usr/include/KF5/KI18n -I/usr/include/KF5/KIOCore -I/usr/include/KF5/KXmlGui/ -I/usr/include/KF5/KConfigWidgets -I/usr/include/KF5/KWidgetsAddons -c dvb/*.cpp
