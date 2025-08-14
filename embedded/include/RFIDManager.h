#ifndef RFID_MANAGER_H
#define RFID_MANAGER_H

#include <MFRC522.h>

class RFIDManager
{
private:
    MFRC522 rfid;

public:
    RFIDManager(uint8_t ssPin, uint8_t rstPin);
    void begin();
    bool isCardPresent();
    String readUID();
};

#endif