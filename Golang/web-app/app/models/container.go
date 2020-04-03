package models

import (
	"strings"

	"api/app/libs/db"
)

func GetContainer(number string) map[string]interface{} {
	response := db.BuilderQuery().
		Select("containers.number,container_type.name type, container_size.name size, container_capacity.name capacity, container_tare.name tare").
		From("containers").
		JoinLeft("container_type", "container_type.id = containers.type").
		JoinLeft("container_size", "container_size.id = containers.size").
		JoinLeft("container_capacity", "container_capacity.id = containers.capacity").
		JoinLeft("container_tare", "container_tare.id = containers.tare").
		Where("containers.number", number).
		Row()

	return response
}

func GetContainers(numbers string) []map[string]interface{} {
	params := strings.Split(numbers, ",")
	args := make([]interface{}, len(params))
	for k, v := range params {
		args[k] = strings.TrimSpace(v)
	}

	response := db.BuilderQuery().
		Select("containers.number,container_type.name type, container_size.name size, container_capacity.name capacity, container_tare.name tare").
		From("containers").
		JoinLeft("container_type", "container_type.id = containers.type").
		JoinLeft("container_size", "container_size.id = containers.size").
		JoinLeft("container_capacity", "container_capacity.id = containers.capacity").
		JoinLeft("container_tare", "container_tare.id = containers.tare").
		WhereIn("containers.number", args).
		Rows()

	return response
}
