package main

import (
	"database/sql"
	"log"

	"github.com/ekefan/afitlms/cloud-server/server"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
)

func main() {
	dbConn, err := sql.Open("postgres",
		"postgresql://root:secret@localhost:5432/afitlms?sslmode=disable")
	if err != nil {
		log.Fatal("Cannot connect to db: ", err)
	}
	defer func() {
		if err := dbConn.Close(); err != nil {
			log.Fatal(err)
		}
	}()

	driver, err := postgres.WithInstance(dbConn, &postgres.Config{})
	if err != nil {
		log.Fatal(err)
	}
	userM, uErr := migrate.NewWithDatabaseInstance(
		"file://./internal/db/migrations/user",
		"postgres", driver,
	)

	if uErr != nil {
		log.Fatalf("failed to load user migration: %v", uErr)
	}

	if err := userM.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("user migration failed: %v", err)
	}

	// Ensure the connection is alive
	if err := dbConn.Ping(); err != nil {
		log.Fatal("Cannot reach the database: ", err)
	}

	server := server.NewServer(dbConn)
	server.StartServer("")
}
