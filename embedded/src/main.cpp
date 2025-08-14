#include <Arduino.h>
#include "ModeManager.h"
#include "KeypadManager.h"
#include "DisplayManager.h"
#include "RFIDManager.h"
#include "EnrollmentHandler.h"
#include "AttendanceHandler.h"
#include "DataStore.h"

#define NETWORK_SSID "_ekefan_"
#define NETWORK_PASSWORD "88888877"
#define HTTP_SERVER_IP "10.31.232.187" // Your Windows IP
#define HTTP_SERVER_PORT 8000
ModeManager modeManager;
DisplayManager displayManager;
DataStore dataStore;
RFIDManager rfid(5, 17);                                             // SDA, RST
NetworkManager network(HTTP_SERVER_IP, HTTP_SERVER_PORT, dataStore); // Replace with your MQTT broker
EnrollmentHandler enrollment(rfid, network, displayManager);
AttendanceHandler attendance(displayManager, rfid, network, dataStore, modeManager);
KeypadManager keypadManager(attendance);

void setup()
{
  Serial.begin(115200);
  displayManager.begin();
  displayManager.showMode(modeManager.getMode(), modeManager.isPrompting());
  rfid.begin();
  displayManager.setScreen(DisplayScreen::MESSAGE);
  displayManager.showMessageAtPos(0, 10, "connecting to network");
  displayManager.clear();
  network.begin(NETWORK_SSID, NETWORK_PASSWORD);
}

void loop()
{
  keypadManager.handleModeChange(modeManager);
  displayManager.showMode(modeManager.getMode(), modeManager.isPrompting());
  if (dataStore.ready)
  {
    modeManager.setAttendanceModeChange(SystemMode::TAKING_ATTENDANCE);
    dataStore.ready = false;
    delay(2000);
  }
  if (modeManager.hasAttendanceTimedOut())
  {
    Serial.println("⏰ Attendance session timed out.");
    displayManager.showMessageAtPos(10, 30, "Session Ended");
    delay(3000);
    network.sendAttendance();
    dataStore.ready = false;
    modeManager.setAttendanceModeChange(SystemMode::ATTENDANCE);
    displayManager.setScreen(DisplayScreen::MESSAGE);
  }
  if ((modeManager.getMode() == SystemMode::TAKING_ATTENDANCE) && !modeManager.isPrompting())
  {
    attendance.checkCard();
  }

  if ((modeManager.getMode() == SystemMode::ENROLLMENT) && !modeManager.isPrompting())
  {
    displayManager.setScreen(DisplayScreen::ENROLLMENT);
    enrollment.update();
  }
  if ((modeManager.getMode() == SystemMode::ATTENDANCE) && !modeManager.isPrompting())
  {
    displayManager.setScreen(DisplayScreen::ATTENDANCE_FILTERS);
    attendance.displayFilters();
  }
}