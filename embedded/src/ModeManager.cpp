#include "ModeManager.h"
#include <Arduino.h>

ModeManager::ModeManager()
{
    currentMode = SystemMode::ATTENDANCE;
    promptActive = false;
    attendanceActive = false;
    takingAttendanceActive = false;
}

void ModeManager::requestModeChange(SystemMode newMode)
{
    requestedMode = newMode;
    promptActive = true;
}

void ModeManager::confirmChange(bool accept)
{
    if (accept)
        currentMode = requestedMode;
    promptActive = false;
}

SystemMode ModeManager::getMode() const
{
    return currentMode;
}

bool ModeManager::isPrompting()
{
    return promptActive;
}

bool ModeManager::isTakingAttendance()
{
    return attendanceActive;
}

bool ModeManager::isAttendanceActive()
{
    return takingAttendanceActive;
}
void ModeManager::setAttendanceModeChange(SystemMode newMode)
{
    currentMode = newMode;
    if (newMode == SystemMode::TAKING_ATTENDANCE)
    {
        attendanceStartTime = millis();
        Serial.print("mode changed to taking attendance");
    }
}

bool ModeManager::hasAttendanceTimedOut(unsigned long timeout)
{
    return (currentMode == SystemMode::TAKING_ATTENDANCE &&
            millis() - attendanceStartTime >= timeout);
}