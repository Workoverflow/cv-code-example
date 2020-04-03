/*
	Package for routing configuration
*/

package routes

import (
	"api/app/controllers"
	"github.com/go-martini/martini"
)

func Welcome() (int, string) {
	return controllers.Welcome()
}

func PageNotFound() (int, string) {
	return controllers.PageNotFound()
}

// ApiRoutes create route group
func ApiRoutes(r martini.Router) {
	r.Get("/platform/:number", func(params martini.Params) (int, string) {
		return controllers.GetPlatform(params["number"])
	})

	r.Get("/platforms/:numbers", func(params martini.Params) (int, string) {
		return controllers.GetPlatforms(params["numbers"])
	})

	r.Get("/container/:number", func(params martini.Params) (int, string) {
		return controllers.GetContainer(params["number"])
	})

	r.Get("/containers/:numbers", func(params martini.Params) (int, string) {
		return controllers.GetContainers(params["numbers"])
	})

	r.Get("/passport/:series/:number", func(params martini.Params) (int, string) {
		return controllers.CheckPassport(params["series"], params["number"])
	})
}
