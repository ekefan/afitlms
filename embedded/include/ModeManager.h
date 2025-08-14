#ifndef MODE_MANAGER_H
#define MODE_MANAGER_H

enum class SystemMode
{
    ATTENDANCE,
    ENROLLMENT,
    TAKING_ATTENDANCE
};

class ModeManager
{
private:
    SystemMode currentMode;
    SystemMode requestedMode;
    bool promptActive;
    bool attendanceActive;
    bool takingAttendanceActive;
    unsigned long attendanceStartTime = 0;

public:
    ModeManager();

    void requestModeChange(SystemMode newMode);
    void confirmChange(bool accept);
    SystemMode getMode() const;
    bool isPrompting();
    bool isTakingAttendance();
    bool isAttendanceActive();
    void setAttendanceModeChange(SystemMode newMode);
    bool hasAttendanceTimedOut(unsigned long timeout = 30000);
};

#endif