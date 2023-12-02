package com.jb.scriptrunner.services;

import com.jb.scriptrunner.models.dtos.Message;
import com.jb.scriptrunner.models.enums.TypeOfMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.UUID;

@Service
public class ScriptRunnerServiceImpl extends ScriptRunnerService {

    private final SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    public ScriptRunnerServiceImpl(SimpMessagingTemplate simpMessagingTemplate) {
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    private void sendMessages(InputStream inputStream, TypeOfMessage typeOfMessage) {
        try {
            InputStreamReader errorStreamReader = new InputStreamReader(inputStream);
            BufferedReader bufferedReader = new BufferedReader(errorStreamReader);

            String line;
            while ((line = bufferedReader.readLine()) != null) {
                System.out.println(line);
                simpMessagingTemplate.convertAndSend("/topic/script-output", new Message(line, typeOfMessage));

            }
        } catch (IOException e) {
            System.out.println(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    public UUID runScript(String script, String command) throws Exception {
        try {
            UUID uuid = UUID.randomUUID();
            File file = new File("src/main/resources/" + uuid + ".kts");
            String path = file.getAbsolutePath();

            try (OutputStream outputStream = new FileOutputStream(file)) {
                outputStream.write(script.replaceAll("\\u00a0", " ").getBytes());
            }

            command += " " + path;

            Process process = new ProcessBuilder(command.split("\\s")).start();

            Thread outputThread = new Thread(() -> {
                sendMessages(process.getInputStream(), TypeOfMessage.OUTPUT);
            });

            Thread errorOutputThread = new Thread(() -> {
                sendMessages(process.getErrorStream(), TypeOfMessage.ERROR);
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
            simpMessagingTemplate.convertAndSend("/topic/script-output", new Message(String.valueOf(exitCode), TypeOfMessage.EXIT_CODE));
            return uuid;
        } catch (IOException | InterruptedException e) {
            System.out.println(e.getMessage());
            throw new Exception(e.getMessage());
        }
    }
}
