package com.jb.script.runner.services;

import com.jb.script.runner.models.dtos.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.UUID;

@Service
public class ScriptRunnerServiceImpl extends ScriptRunnerService {

    private final SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    public ScriptRunnerServiceImpl(SimpMessagingTemplate simpMessagingTemplate) {
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @Override
    public int runScript(MultipartFile script, String command) throws Exception {
        try {
            File file = new File("src/main/resources/" + UUID.randomUUID() + ".kts");
            String path = file.getAbsolutePath();

            try (OutputStream outputStream = new FileOutputStream(file)) {
                outputStream.write(script.getBytes());
            }

            command += " " + path;

            Process process = new ProcessBuilder(command.split("\\s"))
                    .start();

            Thread outputThread = new Thread(() -> {
                try {
                    InputStreamReader inputStreamReader = new InputStreamReader(process.getInputStream());
                    BufferedReader bufferedReader = new BufferedReader(inputStreamReader);

                    String line;
                    while ((line = bufferedReader.readLine()) != null) {
                        System.out.println(line);
                        simpMessagingTemplate.convertAndSend("/topic/script-output", new Message(line, false));
                    }
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });

            Thread errorOutputThread = new Thread(() -> {
                try {
                    InputStreamReader errorStreamReader = new InputStreamReader(process.getErrorStream());
                    BufferedReader bufferedReader = new BufferedReader(errorStreamReader);

                    String line;
                    while((line = bufferedReader.readLine()) != null) {
                        System.out.println(line);
                        simpMessagingTemplate.convertAndSend("/topic/script-output", new Message(line, true));

                    }
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });

            outputThread.start();
            errorOutputThread.start();

            int exitCode = process.waitFor();
            if (file.delete()) {
                System.out.println("File deleted!");
            } else {
                System.out.println("File not deleted!");
            }
            outputThread.join();
            errorOutputThread.join();
            return 1;
        } catch (IOException | InterruptedException e) {
            throw new Exception(e.getMessage());
        }

    }
}
