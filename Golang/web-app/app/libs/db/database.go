package db

import (
	"database/sql"
	c "github.com/akula410/connect"
	"github.com/akula410/builder"
	"api/app/configs/app"
)

type query struct {
	builder.Query
}

/*
	MySQL Connection
*/
var MySql c.MySql

/*
	Create connection to database
*/
func init() {
	MySql.DBName = app.DB_NAME
	MySql.Host = app.DB_HOST
	MySql.User = app.DB_USER
	MySql.Password = app.DB_PASSWORD
	MySql.Port = app.DB_PORT
	MySql.Charset = app.DB_CHARSET
	MySql.MaxOpenCoons = app.DB_MAXCON
	MySql.InterpolateParams = true

	builder.Conn =  func() *sql.DB{
		return MySql.Connect()
	}

	builder.ConnClose = func(){
		MySql.Close()
	}
}

func BuilderQuery() *query{
	db := &query{}
	return db
}