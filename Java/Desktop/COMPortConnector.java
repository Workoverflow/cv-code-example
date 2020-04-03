/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.eit.util;

import com.eit.main.ContactElectrod;
import com.eit.main.MeasurementStatus;
import com.sun.jna.platform.win32.Advapi32Util;
import static com.sun.jna.platform.win32.WinReg.HKEY_LOCAL_MACHINE;
import java.awt.List;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;
import jssc.SerialPortList;
import jssc.SerialPortException;
import java.io.IOException;
import java.io.FileWriter;
import java.io.LineNumberReader;
import java.nio.file.Files;
import javax.swing.JOptionPane;


/**
 * Класс COMPortConnector реализует взаимодействие программы с измерительным устройством через USB (COM) порт
 */

public class COMPortConnector {

private static SerialPort serialPort, contactPort, connectedPort;
public static String file_type = "init";
public static FileWriter writer;
private static byte[] buffer, contact_buffer;
//Получаем из реестра Windows номер порта присвоенный данному измерительному устройству
private static String port = Advapi32Util.registryGetStringValue(HKEY_LOCAL_MACHINE, "SYSTEM\\CurrentControlSet\\Enum\\USB\\VID_0483&PID_374B&MI_02\\7&2e599bd4&0&0002\\Device Parameters", "PortName");    
public static int skip_rows;

/**
 * test_contact предназначен для запуска и обработки процесса проверки контакта электродов
 */
public void test_contact(){
    contactPort = new SerialPort(port); 
    try {
            contactPort.openPort();
            contactPort.setParams(SerialPort.BAUDRATE_9600, SerialPort.DATABITS_8, SerialPort.STOPBITS_1, SerialPort.PARITY_NONE);
            contactPort.setFlowControlMode(SerialPort.FLOWCONTROL_RTSCTS_IN | SerialPort.FLOWCONTROL_RTSCTS_OUT);
            contactPort.addEventListener(new ContactReader(), SerialPort.MASK_RXCHAR | SerialPort.MASK_BREAK);
            contactPort.writeString("4");
            contactPort.writeInt(0);
            contactPort.writeInt(0);
            contactPort.writeInt(0);
        }
        catch (SerialPortException ex) {
            System.out.println(ex);
        }
    try {
        Thread.sleep(3000);
        show_error();
    } catch (InterruptedException e) {
    }
    
    
    
}

/**
 * Класс ContactReader реализует прослушку USB порта в отдельном потоке для получения данных о состоянии контактов электродов
 */

private static class ContactReader implements SerialPortEventListener { 
    
    public void serialEvent(SerialPortEvent event) {            
        if(event.isRXCHAR() && event.getEventValue() >= 3){             
            try {  
                if((int) event.getEventValue() == (int) 3 && Integer.parseInt(new String(contactPort.readBytes(event.getEventValue())).trim())  == 7){
                    contactPort.closePort();                 
                    MeasurementStatus stat = new MeasurementStatus();
                    stat.setVisible(true);
                    run();
                }else{
                    contact_buffer = contactPort.readBytes(event.getEventValue());
                    writer = new FileWriter("./data/temp/contact_error.dat", true);                 
                    writer.write(new String(contact_buffer));
                    writer.close();
                }
                
                }catch (Exception ex) {
                    System.out.println(ex);
                }                
        }     
    }
}
/**
 * show_error предназначен для отображения пользователю информации о плохом контакте электродов
 */

private static void show_error(){
    try {
        File file = new File("./data/temp/contact_error.dat");
        if(file.exists() == true){
            
            LineNumberReader  lnr = new LineNumberReader(new FileReader(new File("./data/temp/contact_error.dat")));
            lnr.skip(Long.MAX_VALUE);

            
            FileReader fr = new FileReader("./data/temp/contact_error.dat");
            BufferedReader br = new BufferedReader(fr);
            StringBuilder sb = new StringBuilder();
            String line = null;
            
            for(int i = 0; i < (lnr.getLineNumber() + 1); i++){
                line = br.readLine(); 
                if(line != null && line.equals("") == false){
                   String[] parts = line.split(",");
                    sb.append("Обнаружен плохой контакт электрода номер "+parts[1] + " в поясе номер " + parts[0]).append(System.lineSeparator());  
                }else{
                    fr.close();
                    br.close();
                    lnr.close();
                    Files.delete(new File("./data/temp/contact_error.dat").toPath());
                    ContactElectrod cont = new ContactElectrod();
                    cont.setText(sb.toString());
                    cont.setVisible(true); 
                    
                    contactPort.closePort();
                }                 
            }
        

        }
    } catch (IOException | SerialPortException e) {
        System.out.println(e);
    }
    
}

/**
 * run реализует основной процесс измерения и инициализацию параметров работы с USB портом
 */

public static void run(){
    try {
            new File("./data/temp/belt_temp.dat").delete();
        } catch (Exception e) {
        }        
        
        serialPort = new SerialPort(port);
        try {
            //Открываем порт
            serialPort.openPort();
            //Выставляем параметры
            serialPort.setParams(SerialPort.BAUDRATE_9600, SerialPort.DATABITS_8, SerialPort.STOPBITS_1, SerialPort.PARITY_NONE);
            //Включаем аппаратное управление потоком
            serialPort.setFlowControlMode(SerialPort.FLOWCONTROL_RTSCTS_IN | SerialPort.FLOWCONTROL_RTSCTS_OUT);
            //Устанавливаем ивент лисенер и маску
            serialPort.addEventListener(new PortReader(), SerialPort.MASK_RXCHAR | SerialPort.MASK_BREAK);
            serialPort.writeString("5");
            serialPort.writeInt(0);
            serialPort.writeInt(0);
            
            Config conf = new Config();
            String param = conf.getValue("signal_type")+","+conf.getValue("freq")+","+conf.getValue("range");
            serialPort.writeString(param);            
            serialPort.writeInt(0);
            serialPort.writeInt(0);
        }
        catch (SerialPortException ex) {
            System.out.println(ex);
        }
        
        
    }


/**
 * Класс PortReader реализует прослушку USB порта в отдельном потоке для получения данных измерения
 */

private static class PortReader implements SerialPortEventListener { 
    
    public void serialEvent(SerialPortEvent event) {            
        if(event.isRXCHAR() && event.getEventValue() > 0){

            try {  
                buffer = serialPort.readBytes();
                writer = new FileWriter("./data/temp/belt_temp.dat", true);                 
                writer.write(new String(buffer));
                writer.close();                   
                }catch (Exception ex) {
                    System.out.println(ex);
                }                
        }     
    }
}

/**
 * stop предназначена для остановки для остановки процесса измерения и закрытия соединения USB порта
 */

public static void stop(){
    try{
        serialPort.closePort();        
    }catch (SerialPortException ex) {
            System.out.println(ex);
        }
}
/**
 * getConnectedStatus реализует определение статуса подключения измерительного устройства
 * @return возвращает true если устройство подключено и готово к работе и false если нет
 */
public static boolean getConnectedStatus(){
    try {
            connectedPort = new SerialPort(port);            
            if(connectedPort.openPort() == true){
                connectedPort.closePort();
                return true;
            }else{
                connectedPort.closePort();
                return false;
            }
        }catch (SerialPortException ex) {
            return false;
        }
}       
}
