#include "DataStore.h"

DataStore::DataStore()
{
    loadMockData();
}

void DataStore::loadMockData()
{
    courseCodes = {"EEE506", "EEE508", "EEE510", "EEE532"};

    participants = {};
}

void DataStore::markPresent(const String &uid)
{
    for (auto &student : participants)
    {
        if (student.uid == uid)
        {
            student.present = true;
            break;
        }
    }
}

LectureParticipants *DataStore::findStudent(const String &uid)
{
    for (auto &student : participants)
    {
        if (student.uid == uid)
        {
            return &student;
        }
    }
    return nullptr;
}

void DataStore::addStudent(const LectureParticipants &student)
{
    participants.push_back(student);
}

void DataStore::clearParticipants()
{
    participants.clear(); // Clears the vector
    ready = false;
}
