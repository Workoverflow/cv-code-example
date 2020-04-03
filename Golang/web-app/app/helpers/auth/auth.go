package auth

import (
	"net/http"
	"api/app/libs/db"
)

// Middleware
var Auth = func(res http.ResponseWriter, req *http.Request) {
	if !CheckToken(req.Header.Get("X-API-KEY")) {
	  res.WriteHeader(http.StatusUnauthorized)
	}
}

// Check user token
func CheckToken(token string) bool {
	response := db.BuilderQuery().Select("*").From("token").Where("token", token).Where("enable", 1).Row()
	if len(response) > 0 {
		return true
	}

	return false
}