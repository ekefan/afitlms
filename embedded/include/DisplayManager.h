#ifndef DISPLAY_MANAGER_H
#define DISPLAY_MANAGER_H

#include <U8g2lib.h>
#include "ModeManager.h"

enum class DisplayScreen
{
    NONE,
    MODE,
    MESSAGE,
    ATTENDANCE_FILTERS,
    ENROLLMENT,
};

class DisplayManager
{
private:
    U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2;
    DisplayScreen currentScreen;

public:
    DisplayManager();
    void begin();
    void showMode(SystemMode mode, bool prompt);
    void showMessage(const char *msg);
    void showMessageAtPos(u8g2_uint_t x, u8g2_uint_t y, const char *s);
    void clear();
    void render();
    void drawTitle(const char *title);
    void drawLine(int line, const String &text);
    void drawFooter(const char *footer);

    void setScreen(DisplayScreen screen);
    bool isScreen(DisplayScreen screen);
};

#endif