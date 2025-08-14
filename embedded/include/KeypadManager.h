#ifndef KEYPAD_MANAGER_H
#define KEYPAD_MANAGER_H

#include <Keypad.h>
#include "ModeManager.h"
#include "AttendanceHandler.h"

class KeypadManager
{
private:
    Keypad keypad;
    String typedText;
    bool lastIsZero;
    AttendanceHandler &attendance;

public:
    KeypadManager(AttendanceHandler &ah);
    void handleModeChange(ModeManager &modeManager);
    char getKeyFromKeypad();
};

#endif