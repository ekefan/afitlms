#include "DisplayManager.h"

DisplayManager::DisplayManager()
    : u8g2(U8G2_R0, U8X8_PIN_NONE) {}

void DisplayManager::begin()
{
    u8g2.begin();
}

const char *modeToString(SystemMode mode)
{
    switch (mode)
    {
    case SystemMode::ATTENDANCE:
        return "ATTENDANCE";
    case SystemMode::ENROLLMENT:
        return "ENROLLMENT";
    default:
        return "UNKNOWN";
    }
}

void DisplayManager::showMode(SystemMode mode, bool prompt)
{

    u8g2.setFont(u8g2_font_ncenB08_tr);

    if (mode == SystemMode::ATTENDANCE || mode == SystemMode::TAKING_ATTENDANCE)
    {
        u8g2.drawStr(120, 10, "A");
    }
    else
    {
        u8g2.drawStr(120, 10, "E");
    }

    if (prompt)
    {

        setScreen(DisplayScreen::MESSAGE);

        u8g2.drawStr(10, 30, "Change mode?");
        u8g2.drawStr(10, 45, "1: Yes  0: No");
    }

    u8g2.sendBuffer();
}

void DisplayManager::showMessage(const char *msg)
{

    clear();
    u8g2.setFont(u8g2_font_ncenB08_tr);

    u8g2.drawStr(10, 25, msg);

    render();
    currentScreen = DisplayScreen::MESSAGE;
}

void DisplayManager::showMessageAtPos(u8g2_uint_t x, u8g2_uint_t y, const char *s)
{
    u8g2.clearBuffer();
    u8g2.setFont(u8g2_font_ncenB08_tr);
    u8g2.drawStr(x, y, s);

    u8g2.sendBuffer();
}

void DisplayManager::clear()
{
    u8g2.clearBuffer();
}

void DisplayManager::render()
{
    u8g2.sendBuffer();
}

void DisplayManager::drawFooter(const char *footer)
{
    u8g2.setFont(u8g2_font_6x10_tr);
    u8g2.drawStr(60, 60, footer); // Near bottom
}

void DisplayManager::drawTitle(const char *title)
{
    u8g2.setFont(u8g2_font_ncenB08_tr);
    u8g2.drawStr(0, 10, title); // Top margin
}

void DisplayManager::drawLine(int line, const String &text)
{
    u8g2.setFont(u8g2_font_6x10_tr);
    u8g2.drawStr(0, 22 + line * 11, text.c_str()); // More space from title, tighter line spacing
}

void DisplayManager::setScreen(DisplayScreen screen)
{
    if (currentScreen != screen)
    {
        clear();
        currentScreen = screen;
    }
}

bool DisplayManager::isScreen(DisplayScreen screen)
{
    return currentScreen == screen;
}