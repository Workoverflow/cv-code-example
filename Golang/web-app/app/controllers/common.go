package controllers

func Welcome() (int, string) {
	return 401, "Access Denied. To get access contact us https://effex.ru"
}

func PageNotFound() (int, string) {
	return 404, "Page not found."
}