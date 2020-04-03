package main

import (
	"net/http"
	"os"

	"github.com/go-martini/martini"
	"github.com/martini-contrib/gzip"

	"api/app/configs/app"
	"api/app/configs/routes"
	"api/app/helpers/auth"
)

func init() {
	martini.Env = martini.Prod
	os.Setenv("MARTINI_ENV", martini.Env)
}

func main() {
	// Init app config
	app.ConfigInit()

	// create Martini
	m := martini.Classic()

	// Append middleware JSON header
	m.Use(func(w http.ResponseWriter) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
	})

	// Compress response with gzip
	m.Use(gzip.All(gzip.Options{
		CompressionLevel: gzip.BestCompression,
	}))

	// index page
	m.Get("/", routes.Welcome)

	// routes group with Auth middleware
	m.Group("/api/v1", routes.ApiRoutes, auth.Auth)

	// page not found
	m.NotFound(routes.PageNotFound)

	// start server
	m.Run()
}
