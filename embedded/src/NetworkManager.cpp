#include "NetworkManager.h"
#include <ArduinoJson.h>

NetworkManager::NetworkManager(const char *server, int port, DataStore &ds)
    : httpServer(server), httpPort(port), data(ds), connected(false) {}

void NetworkManager::begin(const char *ssid, const char *password)
{
    Serial.printf("Connecting to Wi-Fi (%s)...\n", ssid);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    unsigned long startTime = millis();
    const unsigned long wifiTimeout = 10000; // 10 seconds

    while (WiFi.status() != WL_CONNECTED && millis() - startTime < wifiTimeout)
    {
        delay(500);
        Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("\n✅ Wi-Fi connected.");
        Serial.print("IP address: ");
        Serial.println(WiFi.localIP());
        connected = true;
    }
    else
    {
        Serial.println("\n❌ Wi-Fi connection failed.");
        connected = false;
    }
}

bool NetworkManager::fetchAttendance(const String &courseCode)
{
    if (!connected)
    {
        Serial.println("❌ Not connected to WiFi.");
        return false;
    }

    HTTPClient http;
    String url = "http://" + String(httpServer) + ":" + String(httpPort) + "/attendance/request/" + String(courseCode);

    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    Serial.printf("📤 Sending request to %s\n", url.c_str());

    int httpResponseCode = http.GET();

    if (httpResponseCode >= 200 && httpResponseCode < 300)
    {
        currentCourseCode = courseCode;
        String response = http.getString();
        Serial.println("✅ Response received");
        JsonDocument doc;
        DeserializationError err = deserializeJson(doc, response);

        if (err)
        {
            Serial.println("❌ Failed to parse response JSON:");
            Serial.println(err.c_str());
            http.end();
            return false;
        }

        data.clearParticipants();
        for (JsonObject obj : doc.as<JsonArray>())
        {
            LectureParticipants p;
            p.uid = obj["uid"].as<String>();
            p.name = obj["name"].as<String>();
            p.uniqueId = obj["uniqueId"].as<String>();
            p.present = false;
            data.addStudent(p);
        }

        data.ready = true;
        http.end();
        return true;
    }
    else
    {
        Serial.printf("❌ HTTP Error code: %d\n", httpResponseCode);
        http.end();
        return false;
    }
    return false;
}

bool NetworkManager::isConnected() const
{
    return connected;
}

bool NetworkManager::sendAttendance()
{
    if (!connected)
    {
        Serial.println("❌ Not connected to WiFi.");
        return false;
    }

    HTTPClient http;
    String url = "http://" + String(httpServer) + ":" + String(httpPort) + "/attendance/response/" + currentCourseCode;

    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    Serial.printf("📤 Sending request to %s\n", url.c_str());

    String jsonPayload;
    JsonDocument doc;
    JsonArray participants = doc.to<JsonArray>();

    for (const auto &participant : data.participants)
    {
        JsonObject participantObj = participants.add<JsonObject>();
        if (!participantObj)
        {
            Serial.println("❌ Failed to create JSON object for participant.");
            http.end();
            return false;
        }
        participantObj["uid"] = participant.uid;
        participantObj["name"] = participant.name;
        participantObj["uniqueId"] = participant.uniqueId;
        participantObj["present"] = participant.present;
    }

    serializeJson(doc, jsonPayload);

    Serial.println("📋 JSON Payload:");
    Serial.println(jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0 && httpResponseCode == 200)
    {
        String response = http.getString();
        Serial.printf("✅ Attendance sent! HTTP %d\n", httpResponseCode);
        Serial.println("📥 Response: " + response);

        data.participants.clear();
        http.end();
        return true;
    }
    else
    {
        Serial.printf("❌ Failed to send attendance. Error code: %d\n", httpResponseCode);
        http.end();
        return false;
    }
}