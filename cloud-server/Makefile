DB_URL=postgresql://root:secret@localhost:5432/afitlms?sslmode=disable
MIGRATIONS_DIR=internal/db/migrations/user
MIGRATE_SOURCE=file://${MIGRATIONS_DIR}

# create migration file for users table
migrate-users:
	migrate create -ext sql -dir ${MIGRATIONS_DIR} -seq init_users_table

migrate-students:
	migrate create -ext sql -dir ${MIGRATIONS_DIR} -seq init_students_table

migrate-lecturers:
	migrate create -ext sql -dir ${MIGRATIONS_DIR} -seq init_lecturers_table

migrate-courses:
	migrate create -ext sql -dir ${MIGRATIONS_DIR} -seq init_courses_table

migrate-attendances:
	migrate create -ext sql -dir ${MIGRATIONS_DIR} -seq init_attendances_table

migrate-new-attendances:
	migrate create -ext sql -dir ${MIGRATIONS_DIR} -seq alter_courses_lecturers_and_students_table

migrate-attendances-fields:
	migrate create -ext sql -dir ${MIGRATIONS_DIR} -seq alter_attendances_table

postgres:
	docker run --name postgres-afitlms -e POSTGRES_USER=root -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=afitlms -p 5432:5432 -d postgres:latest

migrate-down:
	migrate -source ${MIGRATE_SOURCE} -database ${DB_URL} down

migrate-up:
	migrate -source ${MIGRATE_SOURCE} -database ${DB_URL} up
check-ip:
	cat /etc/resolv.conf | grep nameserver | awk '{print $2}'