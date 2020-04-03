package errors

import (
	"net/http"
)

type ApiError struct {
	Code        int    `json:"errorCode"`
	HttpCode    int    `json:"-"`
	Message     string `json:"errorMsg"`
	Info        string `json:"errorInfo"`
}

func (e *ApiError) Error() string {
	return e.Message
}

func NewApiError(err error) *ApiError {
	return &ApiError{0, http.StatusInternalServerError, err.Error(), ""}
}

var ErrUserAccessDenied = &ApiError{403, http.StatusBadRequest, "Access denied", ""}
var PlatformNotFound = &ApiError{200, http.StatusBadRequest, "Platform not found", ""}
var ContainerNotFound = &ApiError{200, http.StatusBadRequest, "Container not found", ""}
var PassportNotFound = &ApiError{200, http.StatusOK, "Passport is valid", ""}