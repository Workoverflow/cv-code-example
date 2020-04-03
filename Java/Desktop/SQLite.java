package com.eit.util;

import java.sql.*;
import java.sql.SQLException;

public final class SQLite {
    
    public static Connection conn;
    private static Statement stm;
    public static SQLite db;
    
    //Определяем путь к файлу базы данных
    private static String PATH_DB = System.getProperty("user.dir") + "/data/db/maindb.s3db";
    //инициализируем объект подключения к базе данных
    public static void Connect() throws ClassNotFoundException, SQLException{
        conn = DriverManager.getConnection("jdbc:sqlite:"+PATH_DB);
        stm = conn.createStatement();
    }
       
    /**
     *
     * @param query Строка запроса подлежащая исполнению
     * @return  возвращает объект типа ResultSet содержащий результаты запроса к БД 
     * @throws SQLException
     */    
    
    public ResultSet query(String query) throws SQLException{
        ResultSet res;
        try {
            this.Connect();
        } catch (ClassNotFoundException e) {
            System.out.print(e.getMessage());
        }
        res = stm.executeQuery(query);  
        return res;
    }
    
     public void exec(String query) throws SQLException{
        try {
            this.Connect();
        } catch (ClassNotFoundException e) {
            System.out.print(e.getMessage());
        }
        
        stm.execute(query);
    }
     
     
    /** 
     * @param insertQuery Строка запроса для вставки данных в базу данных
     * @return Возвращает TRUE если запись в базу данных прошла успешно и FALSE если запись не удалась
     * @throws SQLException
     */
    public int insert(String insertQuery) throws SQLException {
        try {
            this.Connect();
        } catch (ClassNotFoundException e) {
            System.out.print(e.getMessage());
        }
        
        int result = stm.executeUpdate(insertQuery);
        return result; 
    }
 
}