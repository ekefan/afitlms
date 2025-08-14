#ifndef ENROLLMENT_HANDLER_H
#define ENROLLMENT_HANDLER_H

#include "RFIDManager.h"
#include "NetworkManager.h"
#include "DisplayManager.h"

class EnrollmentHandler
{
private:
    RFIDManager &rfid;
    NetworkManager &network;
    DisplayManager &display;
    String encryptedData;

public:
    EnrollmentHandler(RFIDManager &r, NetworkManager &n, DisplayManager &d);
    void update();
};

#endif