package models

import (
	"api/app/libs/db"
)

// CheckPassport validate password
func CheckPassport(series, number string) map[string]interface{} {
	return db.BuilderQuery().Select("series, number").
		From("passports").Where("series", series).
		Where("number", number).Row()
}
