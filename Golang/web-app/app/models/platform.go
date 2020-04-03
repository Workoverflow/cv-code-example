package models

import (
	"fmt"
	"strings"

	"api/app/libs/db"
)

func GetPlatform(number string) map[string]interface{} {
	response := db.BuilderQuery().
		Select(`platforms.number, platform_models.model, platform_models.type, platform_owners.owner, platforms.empty_run, platforms.total_run, platforms.expired, platforms.build_date, platforms.date_last_repair, platforms.date_last_major_repair`).
		From("platforms").
		JoinLeft("platform_models", "platform_models.id = platforms.model").
		JoinLeft("platform_owners", "platform_owners.id = platforms.owner").
		Where("platforms.number", number).
		Row()

	return response
}

func GetPlatforms(numbers string) []map[string]interface{} {

	params := strings.Split(numbers, ",")
	args := make([]interface{}, len(params))
	for k, v := range params {
		args[k] = strings.TrimSpace(v)
	}

	fmt.Println(args)

	response := db.BuilderQuery().
		Select(`platforms.number, platform_models.model, platform_models.type, platform_owners.owner, platforms.empty_run, platforms.total_run, platforms.expired, platforms.build_date, platforms.date_last_repair, platforms.date_last_major_repair, platforms.model model_id, platforms.owner owner_id`).
		From("platforms").
		JoinLeft("platform_models", "platform_models.id = platforms.model").
		JoinLeft("platform_owners", "platform_owners.id = platforms.owner").
		WhereIn("platforms.number", args).
		Rows()
	fmt.Println(response)
	return response
}
