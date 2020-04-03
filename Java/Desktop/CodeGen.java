/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.eit.util;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import javax.imageio.ImageIO;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.oned.Code39Writer;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import com.sun.javafx.iio.ImageStorage;
import java.awt.image.BufferedImage;
import java.util.Hashtable;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;

/**
 * Класс CodeGen предназначен для генерации штрихкодов и QR-кодов из переданной в метод строки
 * 
 */

public class CodeGen {
    //Определяем размеры изображения штрихкода и QR-кода
    private static int QRwidth = 80;
    private static int QRheight = 80;    
    private static int Code39width = 180;
    private static int Code39height = 80;
    private static String ext = "jpeg";
    
    /**
     * getQRCode предназначена для генерации QR кода из переданной строки
     * @param textEncode строка подлежащая кодирования 
     * @return 
     */
    public String getQRCode(String textEncode){
        long file_name = (System.currentTimeMillis() / 1000L) + Other.getIntRandom(1, 1000);
        File file = new File(System.getProperty("user.dir")+"/data/temp/"+file_name+".jpg");
        try {
            Hashtable<EncodeHintType, ErrorCorrectionLevel> hintMap = new Hashtable<EncodeHintType, ErrorCorrectionLevel>();
            hintMap.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.L);
            
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix byteMatrix = qrCodeWriter.encode(textEncode, BarcodeFormat.QR_CODE, QRwidth, QRheight, hintMap);
            int TempWidth = byteMatrix.getWidth();
            int TempHeight = byteMatrix.getWidth();
            BufferedImage image = new BufferedImage(TempWidth, TempHeight, BufferedImage.TYPE_INT_RGB);
            image.createGraphics();
 
            Graphics2D graphics = (Graphics2D) image.getGraphics();
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, TempWidth, TempHeight);
            graphics.setColor(Color.BLACK);
 
            for (int i = 0; i < TempWidth; i++) {
                for (int j = 0; j < TempHeight; j++) {
                    if (byteMatrix.get(i, j)) {
                        graphics.fillRect(i, j, 1, 1);
                    }
                }
            }
            ImageIO.write(image, ext, file);
            
        } catch (WriterException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        return file.getAbsolutePath().toString();        
    }
    
    /**
     * getBarcode предназначена для генерации Штрихкода типа CODE_39 из переданной строки
     * @param textEncode строка подлежащая кодирования 
     * @return 
     */
    
    public String getBarcode(String textEncode){
         long file_name = (System.currentTimeMillis() / 1000L) + Other.getIntRandom(1, 1000);
        File file = new File(System.getProperty("user.dir")+"/data/temp/"+file_name+".jpg");
        try {
            Hashtable<EncodeHintType, ErrorCorrectionLevel> hintMap = new Hashtable<EncodeHintType, ErrorCorrectionLevel>();
            hintMap.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.L);
            
            Code39Writer Code39 = new Code39Writer();
            BitMatrix byteMatrix = Code39.encode(textEncode, BarcodeFormat.CODE_39, Code39width, Code39height, hintMap);
            int TempWidth = byteMatrix.getWidth();
            int TempHeight = byteMatrix.getHeight();
            BufferedImage image = new BufferedImage(TempWidth, TempHeight, BufferedImage.TYPE_INT_RGB);
            image.createGraphics();
 
            Graphics2D graphics = (Graphics2D) image.getGraphics();
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, TempWidth, TempHeight);
            graphics.setColor(Color.BLACK);
 
            for (int i = 0; i < TempWidth; i++) {
                for (int j = 0; j < TempHeight; j++) {
                    if (byteMatrix.get(i, j)) {
                        graphics.fillRect(i, j, 1, 1);
                    }
                }
            }
            ImageIO.write(image, ext, file);
            
        } catch (WriterException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        return file.getAbsolutePath().toString(); 
    }
    
  
    
}
