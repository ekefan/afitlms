#include "EnrollmentHandler.h"

EnrollmentHandler::EnrollmentHandler(RFIDManager &r, NetworkManager &n, DisplayManager &d)
    : rfid(r), network(n), display(d) {}

void EnrollmentHandler::update()
{
    display.showMessageAtPos(10, 30, "Waiting for data...");
    display.showMode(SystemMode::ENROLLMENT, false);

    if (Serial.available())
    {
        Serial.println("Serial is available");
        encryptedData = Serial.readStringUntil('\n');

        display.showMessage("Enrolling...");
        delay(1000); // Reduced delay
        display.showMessage("Place Card");

        // Send status update to Python
        Serial.println("STATUS: Waiting for card");
        Serial.flush();

        unsigned long lastMessageTime = millis();
        const unsigned long messageInterval = 2000;
        bool messageShown = false;

        while (!rfid.isCardPresent())
        {
            unsigned long currentTime = millis();

            if (currentTime - lastMessageTime >= 60000)
            {
                Serial.println("STATUS: Timeout - No card detected");
                display.showMessage("Timeout!");
                delay(1000);
                return; // Exit the function, or use break to exit just the loop
            }

            if (!messageShown || (currentTime - lastMessageTime) >= messageInterval)
            {
                display.showMessage("Please place card");
                Serial.println("STATUS: Still waiting for card");
                lastMessageTime = currentTime;
                messageShown = true;
            }

            delay(100);
        }

        String uid = rfid.readUID();
        display.showMessage("Success!");
        Serial.println("UID: " + uid);
        Serial.flush(); // Ensure data is sent immediately
        display.showMessage(uid.c_str());

        // Send UID immediately with newline

        delay(2000);
        encryptedData = "";
    }
}