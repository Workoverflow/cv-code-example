package controllers

import (
	"encoding/json"
	"api/app/models"
	"api/app/configs/errors"
)

// GetContainer return container info
func GetContainer(number string) (int, string) {
	response := models.GetContainer(number)
	if len(response) > 0 {
		jsonString, _ := json.Marshal(response)
		return 200, string(jsonString)
	}

	error, _ := json.Marshal(errors.ContainerNotFound)
	return 200, string(error)
}

// GetContainers return containers info
func GetContainers(numbers string) (int, string) {
	response := models.GetContainers(numbers)
	if len(response) > 0 {
		jsonString, _ := json.Marshal(response)
		return 200, string(jsonString)
	}

	error, _ := json.Marshal(errors.ContainerNotFound)
	return 200, string(error)
}

// GetPlatform return platform info
func GetPlatform(number string) (int, string) {
	response := models.GetPlatform(number)
	if len(response) > 0 {
		jsonString, _ := json.Marshal(response)
		return 200, string(jsonString)
	}

	error, _ := json.Marshal(errors.PlatformNotFound)
	return 200, string(error)
}

// GetPlatforms return platforms info
func GetPlatforms(numbers string) (int, string) {
	response := models.GetPlatforms(numbers)
	if len(response) > 0 {
		jsonString, _ := json.Marshal(response)
		return 200, string(jsonString)
	}

	error, _ := json.Marshal(errors.PlatformNotFound)
	return 200, string(error)
}


// CheckPassport return passport info
func CheckPassport(series, number string) (int, string) {
	response := models.CheckPassport(series, number)
	if len(response) > 0 {
		jsonString, _ := json.Marshal(response)
		return 200, string(jsonString)
	}

	error, _ := json.Marshal(errors.PassportNotFound)
	return 200, string(error)
}