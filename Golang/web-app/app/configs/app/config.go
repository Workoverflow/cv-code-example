package app


import (
	"os"
	"fmt"
)

/* Database config */
const (
	DB_HOST = "127.0.0.1"
	DB_PORT = "3306"
	DB_NAME = ""
	DB_USER = ""
	DB_PASSWORD = ""
	DB_CHARSET = "utf8"
	DB_MAXCON = 10
)

/* Create databse Uri */
func GetDatabaseUri() string {
	return DB_USER + ":" + DB_PASSWORD + "@tcp(" + DB_HOST + ":" + DB_PORT + ")/" + DB_NAME
}

/* Application config */
func ConfigInit() {
	mode := os.Getenv("MARTINI_ENV")
	fmt.Println("Martini mode: " + mode)
	switch mode {
		case "production":
			setEnv("example.com", "3000")
		default:
			setEnv("127.0.0.1", "3000")
	}
}

/* Set application enviroment vars */
func setEnv(host, port string) {
	os.Setenv("HOST", host)
	os.Setenv("PORT", port)
}