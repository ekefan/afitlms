#include "RFIDManager.h"

RFIDManager::RFIDManager(uint8_t ssPin, uint8_t rstPin)
    : rfid(ssPin, rstPin) {}

void RFIDManager::begin()
{
    SPI.begin();
    rfid.PCD_Init();
}

bool RFIDManager::isCardPresent()
{
    return rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial();
}

String RFIDManager::readUID()
{
    String uid = "";
    for (byte i = 0; i < rfid.uid.size; i++)
    {
        uid += String(rfid.uid.uidByte[i], HEX);
    }
    rfid.PICC_HaltA();
    return uid;
}