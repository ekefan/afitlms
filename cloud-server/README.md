# AFIT LMS cloud server

This directory holds the code the programs the cloud server of the LMS, this server is the single source of truth and the edge server or servers if deployed with scale sync with this server to update their data and provide it with new data when available.
The quality assurance team interact with this server to update lecture meta data such as lecture schedules, venues and sometimes cancellation. So as the students and Lectures to select lectures they will be participating in.

## A little About it's Structure

The server, is split properly into clean bounded contexts called services, these services are:

- attenance: this services provides the implementation for the logic of processing and recording lecture data to get attendance records from the system.
- course: this services exposes it's method to other services and to the external of the system, it's a server for everything about courses, from creation, to enrollment, to recording attendance for that course, to removal of a course from the system.
- enrollment: handles enrollment functionality for the system
- user: This is the biggest services and its branched into student and lecturer services

Each Service has a repository it's connected to and an anti-corruption layer to prevent them from mixing with other bounded contexts.

Img logs from cloud server collaborating with edge server to enroll a new user:
![Alt text](./Screenshot%20(75).png "edge server and cloud server")
