package repository

import (
	"context"
	"database/sql"
	"fmt"

	db "github.com/ekefan/afitlms/cloud-server/internal/db/sqlc"
)

func execTx(ctx context.Context, dbConn *sql.DB, fn func(*db.Queries) error) error {
	tx, err := dbConn.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	txQuery := db.New(tx)
	txErr := fn(txQuery)
	if txErr != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			return fmt.Errorf("txErr: %v\nrbErr: %v", txErr, rbErr)
		}
		return txErr
	}
	return tx.Commit()
}
