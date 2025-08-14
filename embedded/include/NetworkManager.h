#pragma once

#include <WiFi.h>
#include <HTTPClient.h>
#include "DataStore.h"

class NetworkManager
{
public:
    NetworkManager(const char *server, int port, DataStore &ds);
    void begin(const char *ssid, const char *password);
    bool fetchAttendance(const String &courseCode);
    bool sendAttendance();
    bool isConnected() const;

private:
    const char *httpServer;
    int httpPort;
    DataStore &data;
    bool connected;
    String currentCourseCode;
};
