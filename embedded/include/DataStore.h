#ifndef DATA_STORE_H
#define DATA_STORE_H

#pragma once
#include <vector>
#include <map>
#include <Arduino.h>

struct LectureParticipants
{
    String uid;
    String name;
    String uniqueId;
    bool present;
};

class DataStore
{
public:
    std::vector<String> courseCodes;
    std::vector<LectureParticipants> participants;

    DataStore();
    void loadMockData();
    void markPresent(const String &uid);
    LectureParticipants *findStudent(const String &uid);
    void addStudent(const LectureParticipants &student);
    void clearParticipants();
    bool ready;
};

#endif