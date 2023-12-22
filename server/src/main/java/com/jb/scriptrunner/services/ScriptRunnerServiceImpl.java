package com.jb.scriptrunner.services;

import com.jb.scriptrunner.models.dtos.Message;
import com.jb.scriptrunner.models.dtos.ScriptRunResponse;
import com.jb.scriptrunner.models.enums.TypeOfMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.ArrayList;
import java.util.Scanner;
import java.util.UUID;

@Service
public class ScriptRunnerServiceImpl extends ScriptRunnerService {

    private final SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    public ScriptRunnerServiceImpl(SimpMessagingTemplate simpMessagingTemplate) {
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    private void sendMessages(UUID uuid, InputStream inputStream, TypeOfMessage typeOfMessage) {
        try {
            InputStreamReader errorStreamReader = new InputStreamReader(inputStream);
            BufferedReader bufferedReader = new BufferedReader(errorStreamReader);

            String line;
            while ((line = bufferedReader.readLine()) != null) {
                System.out.println(line);
                if (typeOfMessage.equals(TypeOfMessage.ERROR)) {
                    /// here i should separate an error message in 3 parts, the the location, the index of the line,
                    // and the error after, then I should see where the index is from, if it's from the imports
                    // I shouldn't modify anything, if it is from the content, i should decrease the index with 1
                }
                if (line.startsWith("EXECTIME")) {
                    simpMessagingTemplate.convertAndSend("/topic/script-output/" + uuid, new Message(line.replace("EXECTIME", ""), TypeOfMessage.EXECUTION_TIME));
                    continue;
                }
                simpMessagingTemplate.convertAndSend("/topic/script-output/" + uuid, new Message(line, typeOfMessage));
            }
        } catch (IOException e) {
            System.out.println(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    public ScriptRunResponse runScript(UUID uuid, String script, String command) throws Exception {
        try {
            File template = new File("src/main/resources/ExecTimeTemplate.kts");

            File file = new File("src/main/resources/" + uuid + ".kts");
            String path = file.getAbsolutePath();

            boolean isContent = false;
            ArrayList<String> imports = new ArrayList<>();
            ArrayList<String> content = new ArrayList<>();

            for (String val : script.split("\n")) {
                if (!val.matches("(\\s+)?import(\\s+)?.+(\\s+)?") && !val.matches("(\\s+)?")) {
                    isContent = true;
                }

                if (isContent) {
                    content.add(val);
                } else {
                    imports.add(val);
                }
            }

            ArrayList<String> execTimeScript = new ArrayList<>();

            Scanner reader = new Scanner(template);
            while (reader.hasNextLine()) {
                String data = reader.nextLine();

                if (data.equals("$$$imports$$$")) {
                    execTimeScript.add(String.join("\n", imports));
                } else if (data.equals("$$$content$$$")) {
                    execTimeScript.add(String.join("", content));
                } else {
                    execTimeScript.add(data);
                }
            }

            try (OutputStream outputStream = new FileOutputStream(file)) {
                outputStream.write(String.join("\n", execTimeScript).replaceAll("\\u00a0", " ").getBytes());
            }

            command += " " + path;

            long startTime = System.currentTimeMillis();
            Process process = new ProcessBuilder(command.split("\\s")).start();

            Thread outputThread = new Thread(() -> {
                sendMessages(uuid, process.getInputStream(), TypeOfMessage.OUTPUT);
            });

            Thread errorOutputThread = new Thread(() -> {
                sendMessages(uuid, process.getErrorStream(), TypeOfMessage.ERROR);
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
            simpMessagingTemplate.convertAndSend("/topic/script-output/" + uuid, new Message(String.valueOf(exitCode), TypeOfMessage.EXIT_CODE));
            return new ScriptRunResponse(uuid, System.currentTimeMillis() - startTime);
        } catch (IOException | InterruptedException e) {
            System.out.println(e.getMessage());
            throw new Exception(e.getMessage());
        }
    }

    @Override
    public void runMultipleTimes(UUID uuid, String script, String command, int count) throws Exception {
        long expectedTimePerScript = -1;

        File file = new File("src/main/resources/" + uuid + ".kts");
        String path = file.getAbsolutePath();

        try (OutputStream outputStream = new FileOutputStream(file)) {
            outputStream.write(script.replaceAll("\\u00a0", " ").getBytes());
        }

        command += " " + path;

        while (count > 0) {
            long startTime = System.currentTimeMillis();
            Process process = new ProcessBuilder(command.split("\\s")).start();

            Thread outputThread = new Thread(() -> {
                sendMessages(uuid, process.getInputStream(), TypeOfMessage.OUTPUT);
            });

            Thread errorOutputThread = new Thread(() -> {
                sendMessages(uuid, process.getErrorStream(), TypeOfMessage.ERROR);
            });

            outputThread.start();
            errorOutputThread.start();

            int exitCode = process.waitFor();
            outputThread.join();
            errorOutputThread.join();
            simpMessagingTemplate.convertAndSend("/topic/script-output/" + uuid, new Message(String.valueOf(exitCode), TypeOfMessage.EXIT_CODE));
            expectedTimePerScript = System.currentTimeMillis() - startTime;
            System.out.println(count + ": " + expectedTimePerScript);
            count--;
        }

        if (file.delete()) {
            System.out.println("File deleted!");
        } else {
            System.out.println("File not deleted!");
        }
    }
}
