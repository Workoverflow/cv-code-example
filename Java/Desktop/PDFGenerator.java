package com.eit.util;

import com.itextpdf.text.DocumentException;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Image;
import com.itextpdf.text.pdf.PdfCopy;
import com.itextpdf.text.pdf.PdfDocument;
import com.itextpdf.text.pdf.PdfImportedPage;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.tool.xml.XMLWorkerHelper;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.print.DocPrintJob;
import javax.print.PrintService;
import javax.print.SimpleDoc;
import javax.print.attribute.HashPrintRequestAttributeSet;
import javax.swing.JOptionPane;
import javax.swing.table.DefaultTableModel;

/**
 *
 * @author user
 */
public class PDFGenerator {
    /**
     * generatePatientCard создает карту пациента на сонове HTML-шаблона
     * @return Возвращает ссылку на PDF докуент      * 
     * 
     */
    public static String generatePatientCard(ResultSet card, int pid, String patient_dir){
        //Путь для сохранени временного PDF файла
        String temp = System.getProperty("user.dir") + "/data/temp/temp.pdf";
        if(pid != 0){        
        HtmlParser parser = new HtmlParser(); 
       
        String card_template = "";
        try {
           //Получаем карту пациента в формате HTML с заполнеными полями
           card_template = parser.getCardTemplte(card, patient_dir);
        } catch (IOException e) {
            System.out.print(e.getMessage());
        }
        try {
            //Создаем выходной поток для записи в PDF документ
            FileOutputStream pdfOutputStream = new FileOutputStream(temp);
            
            PdfDocument document = new PdfDocument();
            FontFactory.defaultEmbedding = true;
            //Устанавливаем параметры PDF документа
            document.setPageSize(com.itextpdf.text.PageSize.A4);
            
            try {
                PdfWriter pdfWriter = PdfWriter.getInstance(document, pdfOutputStream);
                //Записываем данные в PDF документ
                document.addWriter(pdfWriter);
                document.open();               
                try {
                              
                    XMLWorkerHelper.getInstance().parseXHtml(pdfWriter, document, new StringReader(card_template));
                    //Закрыаем документ и выходной поток
                    document.close();
                    pdfWriter.close();
                    pdfOutputStream.close();
                } catch (IOException e) {
                }
                 

            } catch (DocumentException e) {
            }

        } catch ( FileNotFoundException e) {
        } 
        }else{
            JOptionPane.showMessageDialog(null, "Для генерации карты пациента в формате PDF выберите его из списка.", "Генерация PDF карты", JOptionPane.ERROR_MESSAGE);
        }
        
        return temp;
    }
    /**
     * getCleanPDFCard принимает на вход PDF документ и удаляет из него пустые страницы
     * @return возвращает готовый PDF-документ содержащий карту пациента
     * 
     */
    public void getCleanPDFCard(ResultSet card, int pid, String output, String patient_dir){
        //Получаем путь до временного PDF файла
        String temp = generatePatientCard(card, pid, patient_dir);
        
        try {
            //Создаем новый объект PDF документа
            PdfDocument document = new PdfDocument();
            PdfReader r = new PdfReader(temp);
            PdfCopy wr = new PdfCopy(document, new FileOutputStream(output));
            PdfImportedPage page = null;
            FontFactory.defaultEmbedding = true; 
            //Устанавливаем параметры документа
            document.setPageSize(com.itextpdf.text.PageSize.A4);
            document.setMargins(35, 35, 15, 15);
            document.addWriter(wr);
            document.open();
            
            //Импортируем в новый PDF документ все не пустные страницы из временного документа
            for(int i = 1; i < r.getNumberOfPages(); i++){
                if(r.getPageContent(i).length > 32){
                    page = wr.getImportedPage(r, i);
                    wr.addPage(page);
                    
               }                
            }             
            //Закрываем документ и поток вывода
            document.close();
            r.close();
            wr.close();
            removeTempPDFFile(temp);
            
        } catch (DocumentException | IOException e) {
            e.getMessage();
        }
    }
    
    /**
     * 
     * generateProtocol создает вреенный файл PDF протокола на основе HTML-шаблона протоколв
     * @return Возвращает до временного PDF документа
     */
    public static String generateProtocol(String[] data, String patient_dir, int pid) {
       //Путь до временного PDF докуента протокола
        String temp = System.getProperty("user.dir") + "/data/temp/temp.pdf";
        if(pid != 0){        
        HtmlParser parser = new HtmlParser(); 
       
        String protocol_template = "";
        try {
           //Получаем шаблон протокола с заполненными палями из базы данных
           protocol_template = parser.getProtocolTemplate(data, patient_dir, pid);
        } catch (IOException e) {
            System.out.print(e.getMessage());
        }
        try {
            //Открываем выходной поток для записи в файл
            FileOutputStream pdfOutputStream = new FileOutputStream(temp);
            //Устанавливаем параметры документа
            PdfDocument document = new PdfDocument();
            FontFactory.defaultEmbedding = true;            
            document.setPageSize(com.itextpdf.text.PageSize.A4);   
            
            
            try {
                PdfWriter pdfWriter = PdfWriter.getInstance(document, pdfOutputStream);
                document.addWriter(pdfWriter);
                document.open();
               
                try {
                    //Создаем объект XMLWorkerHelper для записи HTML в PDF
                    XMLWorkerHelper.getInstance().parseXHtml(pdfWriter, document, new StringReader(protocol_template));
                    document.close();
                    pdfWriter.close();
                    pdfOutputStream.close();
                } catch (IOException e) {
                }
                 

            } catch (DocumentException e) {
            }

        } catch ( FileNotFoundException e) {
        } 
        }else{
            JOptionPane.showMessageDialog(null, "Для сохранения протокола в PDF выберите пациента и протокол из списка.", "Генерация PDF протокола", JOptionPane.ERROR_MESSAGE);
        }
    
        
        return temp;
     }
    
    /**
     * getClearProtocol принемает временный протокол и удаляет из него пустые страницы 
     * @return Возвращает путь до файла с готовым протоколом
     */
    public void getClearProtocol(String[] data, String patient_dir, int pid){
        SQLite db = new SQLite();
        String temp = generateProtocol(data, patient_dir, pid);
        //Указываем директорию для сохранения готового протокола
        String output = patient_dir + "/" + data[7] + "/protocol.pdf";
        
        try {
            //Создаем объект PDF документа
            PdfDocument document = new PdfDocument();
            PdfReader r = new PdfReader(temp);
            PdfCopy wr = new PdfCopy(document, new FileOutputStream(output));
            PdfImportedPage page = null;
            //Указываем параметры документа
            FontFactory.defaultEmbedding = true;            
            document.setPageSize(com.itextpdf.text.PageSize.A4);
            document.setMargins(35, 35, 15, 15);
            document.addWriter(wr);
            document.open();
            //Импортируем в новый PDF документ все не пустные страницы из временного документа
            for(int i = 1; i < r.getNumberOfPages(); i++){
                if(r.getPageContent(i).length > 32){
                    page = wr.getImportedPage(r, i);
                    wr.addPage(page);
               }                
            }             
            //Закрываем документ и выходной поток записи
            document.close();
            r.close();
            wr.close();
            removeTempPDFFile(temp);
            
        } catch (DocumentException | IOException e) {
            e.getMessage();
        }
        
       
        try {
           //Сохраняем ссылку на протокол в базе данных для конкретного пациента и измерения
           db.query("INSERT INTO `protocols` (`card_id`, `doc_id`, `file_link`) VALUES ('"+pid+"', '"+data[3]+"', '"+output+"' )"); 
           db.conn.close();
        } catch (SQLException e) {
            System.out.print(e);
        }
            
    }
    
    /**
     * generateReport реализует генерацию протокола исследования на основе HTML шаблона в фомрате PDF 
     * 
     */
    public static String generateReport(DefaultTableModel model, long crc){
        //Путь до временного PDF докуента отчета
        String temp = System.getProperty("user.dir") + "/data/temp/temp.pdf";       
        HtmlParser parser = new HtmlParser(); 
       
        String report_template = "";
        try {
            //Получаем шаблон отчета с заполненными палями из базы данных
           report_template = parser.getReportTemplate(model, crc);
        } catch (IOException e) {
            System.out.print(e.getMessage());
        }
        try {
            //Открываем выходной поток для записи в файл
            FileOutputStream pdfOutputStream = new FileOutputStream(temp);
            //Устанавливаем параметры документа
            PdfDocument document = new PdfDocument();
            FontFactory.defaultEmbedding = true;            
            document.setPageSize(com.itextpdf.text.PageSize.A4);          
            
            
            try {
                PdfWriter pdfWriter = PdfWriter.getInstance(document, pdfOutputStream);
                
                document.addWriter(pdfWriter);
                document.open();
               
                try {
                    //Создаем объект XMLWorkerHelper для записи HTML в PDF
                    XMLWorkerHelper.getInstance().parseXHtml(pdfWriter, document, new StringReader(report_template));
                    document.close();
                    pdfWriter.close();
                    pdfOutputStream.close();
                } catch (IOException e) {
                }
                 

            } catch (DocumentException e) {
            }

        } catch ( FileNotFoundException e) {
        
        }
        
        return temp;
    }
    /**
     * getClearReport принемает временный файл отчета и удаляет из него пустые страницы
     * @return возвращает путь до файла готового отчета
     */
    public void getClearReport(DefaultTableModel model, long crc, String output){
        SQLite db = new SQLite();
        String temp = generateReport(model, crc);
        
        try {
            //Создаем новый объект PDF документа
            PdfDocument document = new PdfDocument();
            PdfReader r = new PdfReader(temp);
            PdfCopy wr = new PdfCopy(document, new FileOutputStream(output));
            PdfImportedPage page = null;
            //Устанавливаем параметры PDF документа 
            FontFactory.defaultEmbedding = true;            
            document.setPageSize(com.itextpdf.text.PageSize.A4);
            document.setMargins(35, 35, 15, 15);
            document.addWriter(wr);
            document.open();
            
            
            for(int i = 1; i < r.getNumberOfPages(); i++){
                if(r.getPageContent(i).length > 32){
                    page = wr.getImportedPage(r, i);
                    wr.addPage(page);
               }                
            }             

            document.close();
            r.close();
            wr.close();
            removeTempPDFFile(temp);
            
        } catch (DocumentException | IOException e) {
            e.getMessage();
        }
            
    }
    
    
    
    /**
     * 
     * removeTempPDFFile предназначена для удалени временных файлов, образованных во время генерации PDF протоколов, отчетов и карты пациента
     * @throws FileNotFoundException 
     */   
    public void removeTempPDFFile(String temp) throws FileNotFoundException{
        new File(temp).delete(); 
        
    }

}
