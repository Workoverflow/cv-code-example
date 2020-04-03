package com.eit.util;

import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FilenameFilter;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import javax.imageio.ImageIO;
import org.dcm4che3.data.Attributes;
import org.dcm4che3.data.Tag;
import org.dcm4che3.data.UID;
import org.dcm4che3.data.VR;
import org.dcm4che3.io.DicomOutputStream;
import org.dcm4che3.util.UIDUtils;

import org.slf4j.LoggerFactory;
import org.apache.log4j.*;
import org.dcm4che3.io.DicomInputStream;
import org.joda.time.Interval;
import org.joda.time.Period;

/**
 * Класс DICOM предназначен для экспорта результатов реконструкции в формате DICOM
 * 
 */
public class DICOM {
   
   private static int  jpgLen; 
   private String transferSyntax = UID.JPEGBaseline1;
  
   /**
    * startExport реализует экспорт файлов исследования выбранных пациентов в формате DICOM
    * @param cards содержит массив идетификаторов карт пациентов
    */
   public void startExport(int[] cards){
        //Инициализируем класс работы с базой данных
        SQLite db = new SQLite();
        ResultSet res, patient;
        //Получаем путь экспорта DICOM файлов
        String export_path = createExportDir();
        String import_path = "";
        
        try {
        
        for(int i = 0; i < cards.length; i++){
                //получаем из базы данных информацию о пациенте с соответстующим ID
                patient = db.query("SELECT `id`, `surname`, `name`, `patronymic`, strftime('%d/%m/%Y', `birthdate`) as `birthday`, `register_adress`, `sex` FROM `patient_card` WHERE `id` = '"+cards[i]+"' ");
                //получаем из базы данных количество исследований для конкретного пациента по ID 
                res = db.query("SELECT `id`, `date` FROM `protocols` WHERE `card_id` = '"+cards[i]+"' ");
                
                
                while(res.next()){
                    //Определяем дирректория с файлами для экспорта
                    import_path = "./data/files/" + cards[i] + "/" + res.getString("id")+"/";
                    //Формируем строку ФИО пациента 
                    String fio = patient.getString("surname") + " " + patient.getString("name") + " " + patient.getString("patronymic");                             
                    //Создаем в директории экспорта каталог с ФИО пациента и номером исследования
                    File mkdir_export_img = new File(export_path + "/" + fio + "/Исследование №" + res.getString("id"));
                    mkdir_export_img.mkdirs();
                    
                    //Получаем все файлы с форматом JPG
                    File folder = new File(import_path);        
                    String[] files = folder.list(new FilenameFilter() {

                        @Override public boolean accept(File folder, String name) {
                            return name.endsWith(".jpg");
                        }

                    });
                    //В цикле экспортируем файлы изображений в формате DICOM
                    for ( String fileName : files ) {
                        File input_img = new File(import_path + fileName);
                        File export_img = new File(export_path + "/"+ fio+ "/Исследование №" + res.getString("id")+"/Реконструкция изображения с пояса № "+fileName.charAt(9)+".dcm");
                        String sex = Other.getSex(patient.getInt("sex"));
                        //Вызываем метод JPG2DCM для генерации DICOM файла из изображения
                        JPG2DCM(input_img, export_img, fio, sex, cards[i], patient.getString("birthday"), patient.getString("register_adress"));  
                    }                     
                    //Копируем в каталог исследования соответвующий протокол исследования
                    File input_pdf = new File(import_path + "protocol.pdf");
                    File export_pdf = new File(export_path + "/" + fio+ "/Исследование №" + res.getString("id")+"/Протокол исследования № "+res.getString("id")+".pdf");
                    
                    try {
                        Files.copy(input_pdf.toPath(), export_pdf.toPath(), StandardCopyOption.REPLACE_EXISTING);                            
                    } catch (IOException e) {} 
                }
            }
                db.conn.close();
            } catch (SQLException e) {
            }
       
   }
   /**
    * createExportDir создает каталог DICOM экспорт АПК ЭИТ БО по указанному для экспорта пути
    * @return возвращает строку содержащую полный путь для экспорта
    */
   public static String createExportDir(){
       //Получаем путь для экспорта данных и со
       Config conf = new Config();
       String export_path = conf.getValue("export_dir") + "/DICOM экспорт АПК ЭИТ БО";
       
       File export_dir = new File(export_path);
       
       if(export_dir.exists()){
           Other other = new Other();
           int random = other.getIntRandom(1, 1000);
           
           export_path = export_path + "["+random+"]";
           File export_dir_clear = new File(export_path);
           export_dir_clear.mkdir();
       }else{
           export_dir.mkdir();
       }
       
       return export_path;       
   }
 
   /**
    * JPG2DCM преобразует изображеие формата JPG в DICOM файл с заполнением DICOM-Tags
    * @param file исходный файл изображения в формате JPG
    * @param fileOutput выходной файл в формате DICOM
    * @param fio ФИО пациента
    * @param sex пол пациента
    * @param pid идентификатор пациента в базе данных
    * @param birthday дата рождения пациента
    * @param adress адрес регистрации пациента
    */
   
    public void JPG2DCM(File file, File fileOutput, String fio, String sex, int pid, String birthday, String adress) {
	try {   
                   
            jpgLen = (int) file.length();            

            BufferedImage jpegImage = ImageIO.read(file);  
            if (jpegImage == null) throw new Exception("Invalid file."); 

            int colorComponents = jpegImage.getColorModel().getNumColorComponents();  
            int bitsPerPixel = jpegImage.getColorModel().getPixelSize();  
            int bitsAllocated = (bitsPerPixel / colorComponents);  
            int samplesPerPixel = colorComponents; 

            Attributes dicom = new Attributes();  
            dicom.setString(Tag.SpecificCharacterSet, VR.CS, "ISO_IR 144");  
            dicom.setString(Tag.PhotometricInterpretation, VR.CS, samplesPerPixel == 3 ? "YBR_FULL_422" : "MONOCHROME2"); 

            dicom.setInt(Tag.SamplesPerPixel, VR.US, samplesPerPixel);           
            dicom.setInt(Tag.Rows, VR.US, jpegImage.getHeight());  
            dicom.setInt(Tag.Columns, VR.US, jpegImage.getWidth());  
            dicom.setInt(Tag.BitsAllocated, VR.US, bitsAllocated);  
            dicom.setInt(Tag.BitsStored, VR.US, bitsAllocated);  
            dicom.setInt(Tag.HighBit, VR.US, bitsAllocated-1);  
            dicom.setInt(Tag.PixelRepresentation, VR.US, 0); 
            dicom.setInt(Tag.SeriesNumber, VR.IS, 3);

            dicom.setDate(Tag.InstanceCreationDate, VR.DA, new Date());  
            dicom.setDate(Tag.InstanceCreationTime, VR.TM, new Date());  

            dicom.setString(Tag.StudyInstanceUID, VR.UI, UIDUtils.createUID());  
            dicom.setString(Tag.SeriesInstanceUID, VR.UI, UIDUtils.createUID());  
            dicom.setString(Tag.SOPInstanceUID, VR.UI, UIDUtils.createUID());  
            dicom.setString(Tag.StudyInstanceUID, VR.UI, UIDUtils.createUID());
            dicom.setString(Tag.SeriesInstanceUID, VR.UI, UIDUtils.createUID());   
            dicom.setString(Tag.SOPInstanceUID, VR.UI, UIDUtils.createUID());
            

            String pattern = "dd/MM/yyyy";
            SimpleDateFormat format = new SimpleDateFormat(pattern);
            Date date = format.parse(birthday);
            
            Interval interval = new Interval(date.getTime(), new Date().getTime());
            Period period = interval.toPeriod();
            
            dicom.setString(Tag.SeriesDescription, VR.ST, "АПК ЭИТ БО");
            dicom.setString(Tag.PatientName, VR.PN, fio);
            dicom.setString(Tag.PatientSex, VR.SH, sex);
            dicom.setInt(Tag.PatientID, VR.IS, pid);
            dicom.setDate(Tag.PatientBirthDate, VR.DT, date);
            dicom.setInt(Tag.PatientAge, VR.IS, period.getYears());
            dicom.setInt(Tag.PatientWeight, VR.IS, 0);
            dicom.setString(Tag.PatientAddress, VR.ST, adress);
            Attributes fmi = new Attributes();

            fmi.setString(Tag.ImplementationVersionName, VR.SH, "DCM4CHE3"); 
            fmi.setString(Tag.ImplementationClassUID, VR.UI, UIDUtils.createUID());
            fmi.setString(Tag.TransferSyntaxUID, VR.UI, transferSyntax);
            fmi.setString(Tag.MediaStorageSOPClassUID, VR.UI, transferSyntax);
            fmi.setString(Tag.MediaStorageSOPInstanceUID, VR.UI,UIDUtils.createUID());
            fmi.setString(Tag.FileMetaInformationVersion, VR.OB, "1"); 
            fmi.setInt(Tag.FileMetaInformationGroupLength, VR.UL, dicom.size()+fmi.size());



            DicomOutputStream dos = new DicomOutputStream(fileOutput);  
            dos.writeDataset(fmi, dicom);  
            dos.writeHeader(Tag.PixelData, VR.OB, -1); 

            dos.writeHeader(Tag.Item, null, 0);

            dos.writeHeader(Tag.Item, null, (jpgLen+1)&~1);  

            FileInputStream fis = new FileInputStream(file);  
            BufferedInputStream bis = new BufferedInputStream(fis);  
            DataInputStream dis = new DataInputStream(bis);  

            byte[] buffer = new byte[65536];         
            int b;  
            while ((b = dis.read(buffer)) > 0) {  
                 dos.write(buffer, 0, b);
                 
             } 

            if ((jpgLen&1) != 0) dos.write(0);   
            dos.writeHeader(Tag.SequenceDelimitationItem, null, 0);
            dos.close();  

	} catch (Exception e) {	
            e.printStackTrace();
	}

   }
    
    
    
    
}
