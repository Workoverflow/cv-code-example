package com.example;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.AudioManager;
import android.media.ExifInterface;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.support.v4.content.FileProvider;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import com.example.BuildConfig;
import com.example.R;

public class Common {

    private final Executor executor = Executors.newFixedThreadPool(5);

    /**
     * Check internet connection
     *
     * @param context
     * @return
     */
    public boolean isConnected(Context context) {
        ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);

        try {
            if (cm == null) throw new AssertionError();
            NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
            if (activeNetwork != null && activeNetwork.isConnected()) {
                try {
                    URL url = new URL("https://google.com");
                    HttpURLConnection urlc = (HttpURLConnection) url.openConnection();
                    urlc.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 YaBrowser/17.11.0.2191 Yowser/2.5 Safari/537.36");
                    urlc.setRequestProperty("Connection", "keep-alive");
                    urlc.setConnectTimeout(1000); // mTimeout is in seconds
                    urlc.connect();
                    return urlc.getResponseCode() == 200;
                } catch (IOException e) {
                    Log.i("warning", "Error checking internet connection", e);
                    return false;
                }
            }
        }catch (NullPointerException e) {
            Toast.makeText(context, R.string.system_error, Toast.LENGTH_SHORT).show();
        }

        return false;
    }

    /**
     * Create image and return real path
     *
     * @param activity
     * @param path
     * @param extension
     * @return
     * @throws IOException
     */
    public File createImageFile(Activity activity, String path, String extension) throws IOException {
        // Create an image file name
        String imageFileName = "image_" + System.currentTimeMillis() + extension;
        File storageDir = new File(activity.getApplicationContext().getExternalFilesDir(Environment.DIRECTORY_PICTURES),  path);

        if (!storageDir.exists()) {
            storageDir.mkdirs();
        }

        return new File(storageDir, imageFileName);
    }

    /**
     * Check and create correct URI link to file
     *
     * @param context
     * @param file
     * @return
     */
    public Uri getUriFromFile(Context context, File file) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            return FileProvider.getUriForFile(context, BuildConfig.APPLICATION_ID + ".fileprovider", file);
        } else {
            return Uri.fromFile(file);
        }
    }

    /**
     * Overload parent method
     *
     * @param input
     * @param resize
     * @param compress_quality
     */
    public void minifyImage(String input, int resize, int compress_quality) {
        minifyImage(input, input, resize, compress_quality);
    }

    /**
     * Check the rotation angle, resize and compress of the image and corrects it, if necessary
     *
     * @param input
     * @param output
     * @param resize
     * @param compress_quality
     */
    public void minifyImage(String input, String output, int resize, int compress_quality) {
        ExifInterface exif;

        Bitmap scaledBitmap = BitmapFactory.decodeFile(input);
        try {
            exif = new ExifInterface(input);

            //correct image angle
            int orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, 0);
            Matrix matrix = new Matrix();
            if (orientation == 6 || orientation == 0) {
                matrix.postRotate(0);
                Log.d("Rotation", "Angle: " + orientation + "(90 deg)");
            } else if (orientation == 3) {
                matrix.postRotate(180);
                Log.d("Rotation", "Angle: " + orientation + "(180 deg)");
            } else if (orientation == 8) {
                matrix.postRotate(270);
                Log.d("Rotation", "Angle: " + orientation + "(270 deg)");
            }
            scaledBitmap = Bitmap.createBitmap(scaledBitmap, 0, 0,
                    scaledBitmap.getWidth(), scaledBitmap.getHeight(), matrix,
                    true);

            FileOutputStream fos = new FileOutputStream(output);

            //resize image
            if(resize > 0) {
                int nh = (int) (scaledBitmap.getHeight() * ((double) resize / scaledBitmap.getWidth()));
                scaledBitmap = Bitmap.createScaledBitmap(scaledBitmap, resize, nh, true);
            }

            //compress image
            if(compress_quality > 0) {
                scaledBitmap.compress(Bitmap.CompressFormat.JPEG, compress_quality, fos);
            }

            fos.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Remove old files in application storage
     *
     * @param activity
     */
    public void clearStorage(Activity activity) {
        String[] folders = {"container", "car"};

        for(String path : folders) {
            File storageDir = new File(activity.getApplicationContext().getExternalFilesDir(Environment.DIRECTORY_PICTURES),  path);
            String[] children = storageDir.list();
            if(children != null) {
                for (int i = 0; i < children.length; i++) {
                    new File(storageDir, children[i]).delete();
                }
            }
        }
    }

    /**
     * Check tablet device
     * @param ctx
     * @return
     */
    public boolean isTablet(Context ctx){
        return (ctx.getResources().getConfiguration().screenLayout & Configuration.SCREENLAYOUT_SIZE_MASK) >= Configuration.SCREENLAYOUT_SIZE_LARGE;
    }

    /**
     * Return the unique identifier for the device
     *
     * @return unique identifier for the device
     */
    @SuppressLint("MissingPermission")
    public String getDeviceIMEI(Context ctx) {
        String deviceUniqueIdentifier = null;
        TelephonyManager tm = (TelephonyManager) ctx.getSystemService(Context.TELEPHONY_SERVICE);
        if (null != tm) {
            deviceUniqueIdentifier = tm.getDeviceId();
        }
        if (null == deviceUniqueIdentifier || 0 == deviceUniqueIdentifier.length()) {
            deviceUniqueIdentifier = Settings.Secure.getString(ctx.getContentResolver(), Settings.Secure.ANDROID_ID);
        }
        return deviceUniqueIdentifier;
    }

    /**
     * Get preference item
     *
     * @param ctx
     * @param key
     * @return
     */
    public String getPreference(Context ctx, String key) {
        SharedPreferences mSettings = ctx.getSharedPreferences(ctx.getString(R.string.preference), Context.MODE_PRIVATE);
        if(mSettings.contains(key)) {
            return mSettings.getString(key, "");
        }
    }

    /**
     * Set preference item
     *
     * @param ctx
     * @param key
     * @param value
     */
    public void setPreference(Context ctx, String key, String value) {
        SharedPreferences mSettings = ctx.getSharedPreferences(ctx.getString(R.string.preference), Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = mSettings.edit();
        editor.putString(key, value);
        editor.apply();
    }


    public void notify(Context ctx, Intent action, String title, String message) {
        if (Build.VERSION.SDK_INT != Build.VERSION_CODES.O) {
            PendingIntent contentIntent = PendingIntent.getActivity(ctx, 0, action, PendingIntent.FLAG_CANCEL_CURRENT);

            Resources res = ctx.getResources();
            String channelID = ctx.getResources().getString(R.string.notify_chanel);
            // Setup Ringtone & Vibrate

            Uri alarmSound = Settings.System.DEFAULT_NOTIFICATION_URI;
            long[] vibratePattern = { 0, 100, 200, 300 };

            NotificationCompat.Builder builder = new NotificationCompat.Builder(ctx, channelID);

            builder.setContentIntent(contentIntent)
                    .setSmallIcon(R.mipmap.ic_launcher_round)
                    .setContentTitle(title)
                    .setContentText(message)
                    .setLargeIcon(BitmapFactory.decodeResource(res, R.mipmap.ic_launcher_round))
                    .setTicker(title)
                    .setWhen(System.currentTimeMillis())
                    .setSound(alarmSound, AudioManager.STREAM_ALARM)
                    .setOnlyAlertOnce(true)
                    .setVibrate(vibratePattern)
                    .setAutoCancel(true);

            NotificationManagerCompat notificationManager = NotificationManagerCompat.from(ctx);
            notificationManager.notify(1, builder.build());
        }
    }
}
