#ifndef ATTENDANCE_HANDLER_H
#define ATTENDANCE_HANDLER_H

#include "DisplayManager.h"
#include "RFIDManager.h"
#include "NetworkManager.h"

enum class AttendanceState
{
    SELECT_COURSE_CODE,
    WAITING_FOR_ATTENDANCE_DATA,
    TAKING_ATTENDANCE,
};

class AttendanceHandler
{
private:
    DisplayManager &display;
    RFIDManager &rfid;
    NetworkManager &network;
    DataStore &data;
    ModeManager &mode;

    AttendanceState state;
    int selectedCourseCodes;

public:
    AttendanceHandler(DisplayManager &d, RFIDManager &r, NetworkManager &n, DataStore &ds, ModeManager &mm);
    void selectCourseFilters(char key);
    void checkCard();
    AttendanceState getState();
    void displayFilters();
};

#endif