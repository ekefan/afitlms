#include "AttendanceHandler.h"

const char *ATTENDANCE_REQUEST_TOPIC = "attendance/request";

AttendanceHandler::AttendanceHandler(DisplayManager &d, RFIDManager &r, NetworkManager &n, DataStore &ds, ModeManager &mm)
    : display(d), rfid(r), network(n), data(ds), mode(mm), state(AttendanceState::SELECT_COURSE_CODE), selectedCourseCodes(-1) {}

void AttendanceHandler::selectCourseFilters(char key)
{
    if (key >= '1' && key <= '4' && state == AttendanceState::TAKING_ATTENDANCE)
    {
        int index = key - '1';
        if (index < data.courseCodes.size())
        {
            selectedCourseCodes = index;
        }
        String courseCode = data.courseCodes[selectedCourseCodes];
        display.setScreen(DisplayScreen::MESSAGE);
        display.showMessage("Ready for attendance");
        delay(1000);
        display.showMessageAtPos(30, 45, courseCode.c_str());
        delay(2000);
        if (network.fetchAttendance(courseCode))
        {
            display.showMessageAtPos(30, 45, "Starting");
            delay(2000);
            display.showMessageAtPos(30, 45, "Scan your cards");
            state = AttendanceState::TAKING_ATTENDANCE;
        }
        else
        {
            display.showMessageAtPos(10, 45, "No lecture data");
            delay(2000);
        }
    }
}

void AttendanceHandler::checkCard()
{

    if (state == AttendanceState::TAKING_ATTENDANCE && rfid.isCardPresent())
    {
        String uid = rfid.readUID();
        LectureParticipants *student = data.findStudent(uid);
        if (student)
        {
            data.markPresent(uid);
            Serial.println(student->name);
            display.showMessage((student->uniqueId).c_str());
            student->present = true;
            delay(1500);
        }
        else
        {
            display.showMessage("Unknown card");
            delay(500);
            display.clear();
            display.showMessageAtPos(30, 45, "Scan your cards");
        }
    }
}

void AttendanceHandler::displayFilters()
{
    data.loadMockData();
    display.drawTitle("Select Course Code");
    for (int i = 0; i < 4; i++)
    {
        if (i < data.courseCodes.size())
        {
            String label = String(i + 1) + ": " + data.courseCodes[i];
            display.drawLine(i, label);
        }
    }
    state = AttendanceState::TAKING_ATTENDANCE;
}

AttendanceState AttendanceHandler::getState()
{
    return state;
}