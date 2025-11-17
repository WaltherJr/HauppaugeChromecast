package com.eriksandsten.hauppaugechromecast.utils;

import com.eriksandsten.hauppaugechromecast.domain.Image;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;

public class ImageHelper {
    public static Image fetchImage(String imageUrl) {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(imageUrl))
                .build();

        try {
            // Make the GET request
            HttpResponse<byte[]> response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());

            // Check if the response status is OK (200)
            if (response.statusCode() == 200) {
                byte[] imageBytes = response.body();

                // Read image from byte array
                try (ByteArrayInputStream bis = new ByteArrayInputStream(imageBytes)) {
                    BufferedImage image = ImageIO.read(bis);
                    if (image != null) {
                        int width = image.getWidth();
                        int height = image.getHeight();
                        System.out.println("Width: " + width + ", Height: " + height);
                        return new Image(width, height, Base64.getEncoder().encodeToString(imageBytes));
                    } else {
                        System.err.println("Failed to decode image (unsupported format or corrupt).");
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            } else {
                System.err.println("Failed to fetch image. HTTP Status Code: " + response.statusCode());
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
        return null;
    }
}
